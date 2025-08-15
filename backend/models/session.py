from pydantic import BaseModel, Field
from enum import Enum
from langchain.memory import ConversationBufferMemory

class InterviewPhase(str, Enum):
    INTRODUCTION = "INTRODUCTION"
    AWAITING_SKILLS = "AWAITING_SKILLS"
    AWAITING_ROLE = "AWAITING_ROLE"
    BEHAVIORAL = "BEHAVIORAL"
    TECHNICAL = "TECHNICAL"
    CODING = "CODING"
    CONCLUSION = "CONCLUSION"
    FEEDBACK = "FEEDBACK"

class InterviewSession(BaseModel):
    phase: InterviewPhase = InterviewPhase.INTRODUCTION
    resume_text: str | None = None
    skills: list[str] = Field(default_factory=list)
    target_role: str | None = None
    # Fix for the deprecation warning
    chat_memory: ConversationBufferMemory = Field(
        default_factory=lambda: ConversationBufferMemory(return_messages=True, memory_key="history")
    )

    class Config:
        arbitrary_types_allowed = True