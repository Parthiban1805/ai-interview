import os
import uuid
import aiofiles
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect

from connection_manager import manager
from models.session import InterviewPhase
from interview_flow.state_manager import create_session, get_session, advance_phase, get_initial_message
from interview_flow.prompt_factory import get_system_prompt
from interview_flow.langchain_chain import create_interview_chain
# IMPORTANT: Import the new batch function
from services.elevenlabs_service import text_to_speech_batch
from services.groq_service import speech_to_text
from services.resume_parser import parse_resume

app = FastAPI()
os.makedirs("uploads", exist_ok=True)

# This function is now much simpler. It gets audio bytes and sends them.
async def speak(client_id: str, text: str):
    audio_bytes = await text_to_speech_batch(text)
    if audio_bytes:
        await manager.send_bytes(audio_bytes, client_id)

@app.post("/upload-resume/{client_id}")
async def upload_resume(client_id: str, file: UploadFile = File(...)):
    session = get_session(client_id)
    if not session:
        return {"error": "Invalid session"}

    file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)

    session.resume_text = parse_resume(file_path)
    os.remove(file_path)

    next_phase = advance_phase(client_id)
    message = get_initial_message(next_phase)
    await speak(client_id, message)
    return {"message": "Resume processed"}

async def handle_llm_response(client_id: str, text: str):
    session = get_session(client_id)
    system_prompt = get_system_prompt(session)
    chain = create_interview_chain(system_prompt, session.chat_memory)
    
    response = await chain.ainvoke({"input": text})

    phase_end_tokens = {
        "[END_BEHAVIORAL]": InterviewPhase.TECHNICAL,
        "[END_TECHNICAL]": InterviewPhase.CODING,
        "[END_CODING]": InterviewPhase.CONCLUSION,
        "[END_CONCLUSION]": InterviewPhase.FEEDBACK,
    }
    
    next_phase_transition_message = ""
    for token, next_phase in phase_end_tokens.items():
        if token in response:
            response = response.replace(token, "").strip()
            session.phase = next_phase
            next_phase_transition_message = get_initial_message(next_phase)
            break

    if response:
        await speak(client_id, response)
    
    if next_phase_transition_message:
        await speak(client_id, next_phase_transition_message)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    create_session(client_id)
    
    initial_message = get_initial_message(InterviewPhase.INTRODUCTION)
    await speak(client_id, initial_message)

    try:
        while True:
            data = await websocket.receive_bytes()
            session = get_session(client_id)
            
            audio_path = f"uploads/{client_id}_audio.webm"
            async with aiofiles.open(audio_path, 'wb') as f:
                await f.write(data)
            
            user_text = await speech_to_text(audio_path)
            os.remove(audio_path)
            
            print(f"[{client_id}] User said: {user_text}")

            if session.phase == InterviewPhase.AWAITING_SKILLS:
                session.skills = [skill.strip() for skill in user_text.split(',')]
                next_phase = advance_phase(client_id)
                message = get_initial_message(next_phase)
                await speak(client_id, message)
            
            elif session.phase == InterviewPhase.AWAITING_ROLE:
                session.target_role = user_text
                next_phase = advance_phase(client_id)
                message = get_initial_message(next_phase)
                await speak(client_id, message)
                await handle_llm_response(client_id, "The user is ready to start.")

            else:
                if user_text.strip():
                    await handle_llm_response(client_id, user_text)

    except WebSocketDisconnect:
        manager.disconnect(client_id)
        print(f"Client {client_id} disconnected.")