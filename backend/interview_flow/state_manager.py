from models.session import InterviewSession, InterviewPhase

# In a real app, this would be a database or Redis cache
sessions: dict[str, InterviewSession] = {}

def create_session(client_id: str) -> InterviewSession:
    sessions[client_id] = InterviewSession()
    return sessions[client_id]

def get_session(client_id: str) -> InterviewSession:
    return sessions.get(client_id)

def get_initial_message(phase: InterviewPhase) -> str:
    messages = {
        InterviewPhase.INTRODUCTION: "Hello! I'm Alex, your AI-powered interview coach. To start, please upload your resume.",
        InterviewPhase.AWAITING_SKILLS: "Thank you. I've received your resume. Now, please list the key skills you want to be interviewed on, separated by commas.",
        InterviewPhase.AWAITING_ROLE: "Great, I have your skills. What type of role are you targeting? For example, 'Senior Backend Engineer'.",
        InterviewPhase.BEHAVIORAL: "Perfect. I've got everything I need. We'll be focusing on your listed skills. Let's get started.",
        InterviewPhase.TECHNICAL: "Great, let's move on to some technical questions.",
        InterviewPhase.CODING: "Excellent. Now let's move on to our coding round.",
        InterviewPhase.CONCLUSION: "Thanks for walking me through that. We're almost at the end of our session.",
        InterviewPhase.FEEDBACK: "Thank you for your questions. I can now provide some feedback on our session."
    }
    return messages.get(phase, "")

def advance_phase(client_id: str) -> InterviewPhase:
    session = get_session(client_id)
    current_phase = session.phase
    
    phase_order = list(InterviewPhase)
    try:
        current_index = phase_order.index(current_phase)
        next_phase = phase_order[current_index + 1]
        session.phase = next_phase
        return next_phase
    except (ValueError, IndexError):
        return current_phase # Or handle end of interview