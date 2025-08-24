# services/elevenlabs_service.py

from elevenlabs.client import AsyncElevenLabs
from config import settings
import json

client = AsyncElevenLabs(api_key=settings.elevenlabs_api_key)

async def text_to_speech_and_visemes_stream(text: str):
    """
    Generates a stream of audio data from ElevenLabs.
    NOTE: Viseme streaming is commented out as it requires a specific subscription plan.
    """
    try:
        # THE FIX: We are using a standard mp3 format that is supported by all plans.
        # This will get the audio working again.
        async for chunk in client.text_to_speech.stream(
            text=text,
            voice_id="21m00Tcm4TlvDq8ikWAM",  # Rachel
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",  # Standard, high-quality MP3 format
        ):
            # We only expect audio data now.
            if chunk:
                yield "audio", chunk

            # The code below is for when you have a plan that supports visemes.
            # if chunk.get("audio"):
            #     yield "audio", chunk["audio"]
            # if chunk.get("visemes"):
            #     viseme_json_string = chunk["visemes"]
            #     visemes = json.loads(viseme_json_string)
            #     for viseme in visemes['viseme_chunks']:
            #         yield "viseme", viseme

    except Exception as e:
        print(f"Error streaming from ElevenLabs: {e}")