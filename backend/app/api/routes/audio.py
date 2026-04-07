from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse
import requests
import os
from app.config import get_settings
from gtts import gTTS
import io
import logging
import hashlib

router = APIRouter()
_settings = get_settings()
logger = logging.getLogger(__name__)

# Language to language code mappings for gTTS
LANGUAGE_CODES_TTS = {
    "English": "en",
    "Hindi": "hi",
    "Bengali": "bn",
    "Telugu": "te",
    "Marathi": "mr",
    "Tamil": "ta",
    "Urdu": "ur",
    "Gujarati": "gu",
    "Kannada": "kn",
    "Odia": "or",
    "Odiya": "or",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Assamese": "as",
    "Maithili": "mai",
    "Santali": "sat",
    "Kashmiri": "ks",
    "Nepali": "ne",
    "Sindhi": "sd",
    "Dogri": "doi",
    "Konkani": "kok",
    "Manipuri": "mni",
    "Bodo": "brx",
    "Sanskrit": "sa"
}

@router.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Query("English")
):
    """
    Takes an audio file (regional Indian language), 
    sends it to Sarvam AI for transcription & translation to English, 
    and returns the translated transcript.
    
    Args:
        file: Audio file (wav/mp3)
        language: Language of the audio (optional)
    """
    try:
        audio_bytes = await file.read()
        
        # Map the input language to Sarvam's language code
        # Sarvam STT supports many Indian languages by code
        sarvam_stt_languages = {
            "English": "en-IN",
            "Hindi": "hi-IN",
            "Bengali": "bn-IN",
            "Telugu": "te-IN",
            "Marathi": "mr-IN",
            "Tamil": "ta-IN",
            "Gujarati": "gu-IN",
            "Kannada": "kn-IN",
            "Odia": "od-IN",
            "Odiya": "od-IN",
            "Malayalam": "ml-IN",
            "Punjabi": "pa-IN"
        }
        
        sarvam_lang_code = sarvam_stt_languages.get(language, "unknown")
        
        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": _settings.SARVAM_API_KEY},
            files={
                "file": ("recording.wav", audio_bytes, "audio/wav")
            },
            data={
                "model": "saaras:v3",
                "mode": "transcribe",  # Return native script instead of English translation
                "language_code": sarvam_lang_code
            }
        )
        
        if response.status_code != 200:
            error_data = response.json()
            raise HTTPException(status_code=response.status_code, detail=f"Sarvam AI Error: {error_data}")
            
        result = response.json()
        logger.info(f"Sarvam API Result: {result}")
        
        return {
            "transcript": result.get("transcript", "No transcript"),
            "language": language,
            "success": True
        }
    except Exception as e:
        logger.error(f"STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tts")
async def text_to_speech(
    text: str = Query(..., min_length=1),
    language: str = Query("English"),
    role: str = Query("opponent")
):
    """
    Convert text to speech in the specified language using Sarvam AI with gTTS fallback.
    
    Args:
        text: Text to convert to speech
        language: Target language
        role: Role/persona (for future use)
        
    Returns:
        Audio stream (MP3 or WAV)
    """
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text is required")
            
        # Clean text and calculate cache key
        text_to_synthesize = text.strip()[:2500]
        cache_key = hashlib.md5(f"{text_to_synthesize}_{language}_{role}".encode('utf-8')).hexdigest()
        
        # Ensure cache directory exists
        cache_dir = os.path.join(os.getcwd(), "cache", "audio")
        os.makedirs(cache_dir, exist_ok=True)
        
        sarvam_file_path = os.path.join(cache_dir, f"{cache_key}.wav")
        gtts_file_path = os.path.join(cache_dir, f"{cache_key}_gtts.mp3")

        # 1. RETURN CACHED FILE IMMEDIATELY IF EXISTS
        # Using FileResponse natively handles HTTP Range requests for pausing/seeking!
        if os.path.exists(sarvam_file_path):
            logger.info(f"Serving CACHED Sarvam TTS for: {language}_{role}")
            return FileResponse(sarvam_file_path, media_type="audio/wav")
        if os.path.exists(gtts_file_path):
            logger.info(f"Serving CACHED gTTS for: {language}_{role}")
            return FileResponse(gtts_file_path, media_type="audio/mpeg")

        # 2. GENERATE NEW AUDIO
        # Sarvam AI TTS mapping with specific recommended speakers based on role
        sarvam_tts_languages = {
            "English": {"code": "en-IN", "male": "ratan", "female": "ishita"},
            "Hindi": {"code": "hi-IN", "male": "shubh", "female": "priya"},
            "Bengali": {"code": "bn-IN", "male": "rehan", "female": "roopa"},
            "Telugu": {"code": "te-IN", "male": "shubh", "female": "neha"},
            "Marathi": {"code": "mr-IN", "male": "ratan", "female": "priya"},
            "Tamil": {"code": "ta-IN", "male": "ratan", "female": "ishita"},
            "Gujarati": {"code": "gu-IN", "male": "ratan", "female": "priya"},
            "Kannada": {"code": "kn-IN", "male": "shubh", "female": "neha"},
            "Odia": {"code": "od-IN", "male": "shubh", "female": "pooja"},
            "Odiya": {"code": "od-IN", "male": "shubh", "female": "pooja"},
            "Malayalam": {"code": "ml-IN", "male": "shubh", "female": "pooja"},
            "Punjabi": {"code": "pa-IN", "male": "mani", "female": "roopa"}
        }

        sarvam_lang = sarvam_tts_languages.get(language)

        if sarvam_lang and _settings.SARVAM_API_KEY:
            try:
                # Decide speaker based on role: judge = Male, opponent = Female
                speaker_choice = sarvam_lang["female"] if role == "opponent" else sarvam_lang["male"]
                
                # Split text into chunks <= 450 chars to perfectly respect Sarvam's 500 char limit
                words = text_to_synthesize.split()
                chunks = []
                current_chunk = []
                for word in words:
                    if len(' '.join(current_chunk + [word])) <= 450:
                        current_chunk.append(word)
                    else:
                        if current_chunk:
                            chunks.append(' '.join(current_chunk))
                        current_chunk = [word]
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                
                wav_components = []
                has_error = False
                for chunk in chunks:
                    if not chunk.strip():
                        continue
                    payload = {
                        "inputs": [chunk],
                        "target_language_code": sarvam_lang["code"],
                        "speaker": speaker_choice,
                        "model": "bulbul:v3"
                    }
                    logger.info(f"Attempting Sarvam AI TTS chunk length {len(chunk)} for language: {language}")
                    
                    response = requests.post(
                        "https://api.sarvam.ai/text-to-speech",
                        headers={
                            "api-subscription-key": _settings.SARVAM_API_KEY,
                            "Content-Type": "application/json"
                        },
                        json=payload,
                        timeout=15
                    )

                    if response.status_code == 200:
                        result = response.json()
                        audio_base64 = result.get("audios", [None])[0]
                        if audio_base64:
                            import base64
                            wav_components.append(base64.b64decode(audio_base64))
                    else:
                        logger.warning(f"Sarvam AI TTS Error on chunk: {response.text}")
                        has_error = True
                        break

                if not has_error and wav_components:
                    logger.info(f"Successfully generated {len(wav_components)} Sarvam TTS chunks. Consolidating...")
                    
                    import wave
                    def concatenate_wavs(wav_bytes_list):
                        if not wav_bytes_list: return b""
                        with wave.open(io.BytesIO(wav_bytes_list[0]), 'rb') as w_in:
                            params = w_in.getparams()
                        out_buffer = io.BytesIO()
                        with wave.open(out_buffer, 'wb') as w_out:
                            w_out.setparams(params)
                            for wav_bytes in wav_bytes_list:
                                try:
                                    with wave.open(io.BytesIO(wav_bytes), 'rb') as w:
                                        w_out.writeframes(w.readframes(w.getnframes()))
                                except Exception:
                                    pass
                        return out_buffer.getvalue()
                        
                    final_wav = concatenate_wavs(wav_components)
                    
                    # Save to cache file
                    with open(sarvam_file_path, "wb") as f:
                        f.write(final_wav)
                        
                    # Serve the file
                    return FileResponse(sarvam_file_path, media_type="audio/wav")
                else:
                    logger.warning(f"Falling back to gTTS due to Sarvam API chunk errors.")

            except Exception as e:
                logger.warning(f"Sarvam API exception: {str(e)}. Falling back to gTTS.")

        # Fallback to gTTS
        lang_code = LANGUAGE_CODES_TTS.get(language, "en")
        
        # Create gTTS object and save to disk
        tts = gTTS(text=text_to_synthesize, lang=lang_code, slow=False)
        tts.save(gtts_file_path)
        
        logger.info(f"Generated and cached gTTS fallback for language: {language}")
        return FileResponse(gtts_file_path, media_type="audio/mpeg")
        
    except Exception as e:
        logger.error(f"TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
