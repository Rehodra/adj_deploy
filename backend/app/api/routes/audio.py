from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import RedirectResponse
import requests
import os
import io
import wave
import base64
import hashlib
import logging

import cloudinary
import cloudinary.uploader

from app.config import get_settings
from gtts import gTTS

router = APIRouter()
_settings = get_settings()
logger = logging.getLogger(__name__)

# ── Cloudinary configuration ─────────────────────────────────────────────────
cloudinary.config(
    cloud_name=_settings.CLOUDINARY_CLOUD_NAME,
    api_key=_settings.CLOUDINARY_API_KEY,
    api_secret=_settings.CLOUDINARY_API_SECRET,
    secure=True,
)

# In-memory URL cache: cache_key -> Cloudinary secure_url
_url_cache: dict[str, str] = {}

# ── Language mappings ─────────────────────────────────────────────────────────
LANGUAGE_CODES_TTS = {
    "English":   "en",
    "Hindi":     "hi",
    "Bengali":   "bn",
    "Telugu":    "te",
    "Marathi":   "mr",
    "Tamil":     "ta",
    "Urdu":      "ur",
    "Gujarati":  "gu",
    "Kannada":   "kn",
    "Odia":      "or",
    "Odiya":     "or",
    "Malayalam": "ml",
    "Punjabi":   "pa",
    "Assamese":  "as",
    "Maithili":  "mai",
    "Santali":   "sat",
    "Kashmiri":  "ks",
    "Nepali":    "ne",
    "Sindhi":    "sd",
    "Dogri":     "doi",
    "Konkani":   "kok",
    "Manipuri":  "mni",
    "Bodo":      "brx",
    "Sanskrit":  "sa",
}

SARVAM_TTS_LANGUAGES = {
    "English":   {"code": "en-IN", "male": "ratan",  "female": "ishita"},
    "Hindi":     {"code": "hi-IN", "male": "shubh",  "female": "priya"},
    "Bengali":   {"code": "bn-IN", "male": "rehan",  "female": "roopa"},
    "Telugu":    {"code": "te-IN", "male": "shubh",  "female": "neha"},
    "Marathi":   {"code": "mr-IN", "male": "ratan",  "female": "priya"},
    "Tamil":     {"code": "ta-IN", "male": "ratan",  "female": "ishita"},
    "Gujarati":  {"code": "gu-IN", "male": "ratan",  "female": "priya"},
    "Kannada":   {"code": "kn-IN", "male": "shubh",  "female": "neha"},
    "Odia":      {"code": "od-IN", "male": "shubh",  "female": "pooja"},
    "Odiya":     {"code": "od-IN", "male": "shubh",  "female": "pooja"},
    "Malayalam": {"code": "ml-IN", "male": "shubh",  "female": "pooja"},
    "Punjabi":   {"code": "pa-IN", "male": "mani",   "female": "roopa"},
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _upload_audio_bytes(audio_bytes: bytes, public_id: str, resource_type: str = "video") -> str:
    """
    Upload raw audio bytes to Cloudinary and return the secure CDN URL.
    Uses resource_type='video' because Cloudinary stores audio under that bucket.
    """
    result = cloudinary.uploader.upload(
        io.BytesIO(audio_bytes),
        public_id=public_id,
        resource_type=resource_type,
        overwrite=False,           # don't re-upload if already there
        folder="adjournment_tts",  # keeps all TTS files in one folder
    )
    return result["secure_url"]


def _concatenate_wavs(wav_bytes_list: list[bytes]) -> bytes:
    """Concatenate multiple WAV byte-strings into a single WAV byte-string."""
    if not wav_bytes_list:
        return b""
    with wave.open(io.BytesIO(wav_bytes_list[0]), "rb") as w_in:
        params = w_in.getparams()
    out_buffer = io.BytesIO()
    with wave.open(out_buffer, "wb") as w_out:
        w_out.setparams(params)
        for wav_bytes in wav_bytes_list:
            try:
                with wave.open(io.BytesIO(wav_bytes), "rb") as w:
                    w_out.writeframes(w.readframes(w.getnframes()))
            except Exception:
                pass
    return out_buffer.getvalue()


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Query("English"),
):
    """
    Takes an audio file (regional Indian language),
    sends it to Sarvam AI for transcription & translation to English,
    and returns the translated transcript.
    """
    try:
        audio_bytes = await file.read()

        response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": _settings.SARVAM_API_KEY},
            files={"file": ("recording.wav", audio_bytes, "audio/wav")},
            data={
                "model": "saaras:v3",
                "mode": "translate",
                "language_code": "unknown",
            },
        )

        if response.status_code != 200:
            error_data = response.json()
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Sarvam AI Error: {error_data}",
            )

        result = response.json()
        logger.info(f"Sarvam API Result: {result}")

        return {
            "transcript": result.get("transcript", "No transcript"),
            "language": language,
            "success": True,
        }
    except Exception as e:
        logger.error(f"STT Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tts")
async def text_to_speech(
    text: str = Query(..., min_length=1),
    language: str = Query("English"),
    role: str = Query("opponent"),
):
    """
    Convert text to speech using Sarvam AI (with gTTS fallback).
    Generated audio is uploaded to Cloudinary; a redirect to the CDN URL is returned.
    In-memory caching prevents duplicate uploads within the same process.
    """
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Text is required")

        text_to_synthesize = text.strip()[:2500]
        cache_key = hashlib.md5(
            f"{text_to_synthesize}_{language}_{role}".encode("utf-8")
        ).hexdigest()

        # ── 1. Serve from in-memory cache if already uploaded ──────────────
        if cache_key in _url_cache:
            logger.info(f"Serving CACHED Cloudinary URL for: {language}_{role}")
            return RedirectResponse(url=_url_cache[cache_key])

        # ── 2. Try Sarvam AI TTS ────────────────────────────────────────────
        sarvam_lang = SARVAM_TTS_LANGUAGES.get(language)

        if sarvam_lang and _settings.SARVAM_API_KEY:
            try:
                speaker = sarvam_lang["female"] if role == "opponent" else sarvam_lang["male"]

                # Split into ≤450-char chunks to respect Sarvam's 500-char limit
                words = text_to_synthesize.split()
                chunks: list[str] = []
                current: list[str] = []
                for word in words:
                    if len(" ".join(current + [word])) <= 450:
                        current.append(word)
                    else:
                        if current:
                            chunks.append(" ".join(current))
                        current = [word]
                if current:
                    chunks.append(" ".join(current))

                wav_parts: list[bytes] = []
                has_error = False

                for chunk in chunks:
                    if not chunk.strip():
                        continue
                    payload = {
                        "inputs": [chunk],
                        "target_language_code": sarvam_lang["code"],
                        "speaker": speaker,
                        "model": "bulbul:v3",
                    }
                    logger.info(
                        f"Sarvam TTS chunk len={len(chunk)} lang={language}"
                    )
                    resp = requests.post(
                        "https://api.sarvam.ai/text-to-speech",
                        headers={
                            "api-subscription-key": _settings.SARVAM_API_KEY,
                            "Content-Type": "application/json",
                        },
                        json=payload,
                        timeout=15,
                    )
                    if resp.status_code == 200:
                        audio_b64 = resp.json().get("audios", [None])[0]
                        if audio_b64:
                            wav_parts.append(base64.b64decode(audio_b64))
                    else:
                        logger.warning(f"Sarvam chunk error: {resp.text}")
                        has_error = True
                        break

                if not has_error and wav_parts:
                    final_wav = _concatenate_wavs(wav_parts)
                    public_id = f"sarvam_{cache_key}"
                    cdn_url = _upload_audio_bytes(final_wav, public_id)
                    _url_cache[cache_key] = cdn_url
                    logger.info(f"Uploaded Sarvam TTS to Cloudinary: {cdn_url}")
                    return RedirectResponse(url=cdn_url)
                else:
                    logger.warning("Falling back to gTTS due to Sarvam errors.")

            except Exception as exc:
                logger.warning(f"Sarvam exception: {exc}. Falling back to gTTS.")

        # ── 3. gTTS fallback ────────────────────────────────────────────────
        lang_code = LANGUAGE_CODES_TTS.get(language, "en")
        mp3_buffer = io.BytesIO()
        tts = gTTS(text=text_to_synthesize, lang=lang_code, slow=False)
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)

        public_id = f"gtts_{cache_key}"
        cdn_url = _upload_audio_bytes(mp3_buffer.read(), public_id)
        _url_cache[cache_key] = cdn_url
        logger.info(f"Uploaded gTTS fallback to Cloudinary: {cdn_url}")
        return RedirectResponse(url=cdn_url)

    except Exception as e:
        logger.error(f"TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
