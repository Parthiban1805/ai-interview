from elevenlabs.client import AsyncElevenLabs
from config import settings

client = AsyncElevenLabs(api_key=settings.elevenlabs_api_key)

async def text_to_speech_batch(text: str) -> bytes:
    """
    Generates a complete audio file from text and returns it as a single bytes object.
    This is a non-streaming, batched approach.
    """
    
    # THE FIX IS HERE: The 'await' keyword has been removed from the line below.
    # The 'async for' loop correctly consumes the async generator returned by the .stream() method.
    audio_data = b"".join([
        chunk async for chunk in client.text_to_speech.stream(
            text=text,
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Voice ID for "Rachel"
            model_id="eleven_multilingual_v2",
        )
    ])
    
    return audio_data