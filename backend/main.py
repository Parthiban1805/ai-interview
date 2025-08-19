import os
import uuid
import aiofiles
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, Form

from connection_manager import manager
from models.session import InterviewPhase
from interview_flow.state_manager import create_session, get_session, advance_phase
from interview_flow.prompt_factory import get_system_prompt
from interview_flow.langchain_chain import create_interview_chain
from services.elevenlabs_service import text_to_speech_batch
from services.groq_service import speech_to_text
from services.resume_parser import parse_resume

app = FastAPI()
os.makedirs("uploads", exist_ok=True)

async def speak(client_id: str, text: str):
    """Generates audio and sends it over the WebSocket."""
    audio_bytes = await text_to_speech_batch(text)
    if audio_bytes:
        await manager.send_bytes(audio_bytes, client_id)

@app.post("/setup-interview/{client_id}")
async def setup_interview(client_id: str, resume: UploadFile = File(...), skills: str = Form(...)):
    """
    Handles the initial setup: receives resume and skills,
    then kicks off the interview by sending the first audio prompt.
    """
    session = get_session(client_id)
    if not session:
        return {"status": "error", "message": "Invalid session"}

    try:
        # 1. Process Resume
        file_path = f"uploads/{uuid.uuid4()}_{resume.filename}"
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await resume.read()
            await out_file.write(content)
        session.resume_text = parse_resume(file_path)
        os.remove(file_path)

        # 2. Process Skills
        session.skills = [skill.strip() for skill in skills.split(',')]
        
        # 3. Advance state to the start of the actual interview
        session.phase = InterviewPhase.BEHAVIORAL
        
        # 4. Kick off the interview with the first question
        # We use the initial prompt from the behavioral phase
        system_prompt = get_system_prompt(session)
        chain = create_interview_chain(system_prompt, session.chat_memory)
        first_question = await chain.ainvoke({"input": "Start the interview now."})
        
        await speak(client_id, first_question)

        return {"status": "success", "message": "Interview setup complete. Starting now."}
    except Exception as e:
        print(f"Error during setup: {e}")
        return {"status": "error", "message": "Failed to set up interview."}


async def handle_llm_response(client_id: str, text: str):
    session = get_session(client_id)
    system_prompt = get_system_prompt(session)
    chain = create_interview_chain(system_prompt, session.chat_memory)
    
    response = await chain.ainvoke({"input": text})
    await manager.active_connections[client_id].send_json({"type": "transcript", "data": f"Alex: {response}"})

    phase_end_tokens = {
        "[END_BEHAVIORAL]": ("Great, let's move on to some technical questions.", InterviewPhase.TECHNICAL),
        "[END_TECHNICAL]": ("Excellent. Now let's move on to our coding round.", InterviewPhase.CODING),
        "[END_CODING]": ("Thanks for walking me through that. We're almost at the end.", InterviewPhase.CONCLUSION),
        "[END_CONCLUSION]": ("Thank you for your questions. I can now provide some feedback.", InterviewPhase.FEEDBACK),
    }
    
    next_phase_transition_message = ""
    for token, (message, next_phase) in phase_end_tokens.items():
        if token in response:
            response = response.replace(token, "").strip()
            session.phase = next_phase
            next_phase_transition_message = message
            break

    if response:
        await speak(client_id, response)
    
    if next_phase_transition_message:
        await speak(client_id, next_phase_transition_message)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    session = create_session(client_id)
    
    # Send a simple welcome message, wait for setup via HTTP
    await speak(client_id, "Hello! I'm Alex. Please provide your resume and skills to begin.")

    try:
        while True:
            # The WebSocket now ONLY handles user audio responses
            data = await websocket.receive_bytes()
            
            audio_path = f"uploads/{client_id}_audio.webm"
            async with aiofiles.open(audio_path, 'wb') as f:
                await f.write(data)
            
            user_text = await speech_to_text(audio_path)
            os.remove(audio_path)
            
            print(f"[{client_id}] User said: {user_text}")
            await manager.active_connections[client_id].send_json({"type": "transcript", "data": f"You: {user_text}"})

            if user_text.strip():
                await handle_llm_response(client_id, user_text)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        print(f"Client {client_id} disconnected.")