from groq import AsyncGroq
from config import settings
import aiofiles

client = AsyncGroq(api_key=settings.groq_api_key)

async def speech_to_text(audio_filepath: str) -> str:
    """Transcribes audio using Groq Whisper API."""
    async with aiofiles.open(audio_filepath, "rb") as f:
        audio_data = await f.read()
    
    transcription = await client.audio.transcriptions.create(
        file=(audio_filepath, audio_data),
        model="whisper-large-v3",
    )
    return transcription.text