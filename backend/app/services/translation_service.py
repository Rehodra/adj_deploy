"""
Translation Service for Multilingual Support
Handles translation between English and Indian languages using Google Translate
"""

import httpx
from typing import Optional
import urllib.parse
import logging

logger = logging.getLogger(__name__)

class TranslationService:
    """Service for translating text between languages"""
    
    # Language code mappings for Google Translate
    LANGUAGE_CODES = {
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
    
    # Language code mappings for Sarvam AI Translate
    SARVAM_LANGUAGE_CODES = {
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
    
    def __init__(self):
        """Initialize translation service"""
        self.available = True
        self.timeout = 10
            
    async def translate(self, 
                       text: str, 
                       target_language: str, 
                       source_language: str = "English") -> str:
        """
        Translate text from source language to target language
        
        Args:
            text: Text to translate
            target_language: Target language name
            source_language: Source language name (default: English)
            
        Returns:
            Translated text
        """
        if not text or text.strip() == "":
            return text
            
        # If source and target are the same, no need to translate
        if source_language == target_language:
            return text
            
        # Try Sarvam AI First
        sarvam_source = self.SARVAM_LANGUAGE_CODES.get(source_language)
        sarvam_target = self.SARVAM_LANGUAGE_CODES.get(target_language)
        
        if sarvam_source and sarvam_target:
            try:
                from app.config import get_settings
                settings = get_settings()
                if settings.SARVAM_API_KEY:
                    async with httpx.AsyncClient() as client:
                        translate_url = "https://api.sarvam.ai/translate"
                        headers = {
                            "Content-Type": "application/json",
                            "api-subscription-key": settings.SARVAM_API_KEY
                        }
                        # Prepare chunks <= 950 characters
                        words = text.split()
                        chunks = []
                        current_chunk = []
                        for word in words:
                            if len(' '.join(current_chunk + [word])) <= 950:
                                current_chunk.append(word)
                            else:
                                if current_chunk:
                                    chunks.append(' '.join(current_chunk))
                                current_chunk = [word]
                        if current_chunk:
                            chunks.append(' '.join(current_chunk))
                            
                        translated_chunks = []
                        has_error = False
                        
                        for chunk in chunks:
                            payload = {
                                "input": chunk,
                                "source_language_code": sarvam_source,
                                "target_language_code": sarvam_target,
                                "speaker_gender": "Male",
                                "model": "mayura:v1",
                                "mode": "formal",
                                "algo": "nmt"
                            }
                            
                            response = await client.post(translate_url, headers=headers, json=payload, timeout=self.timeout)
                            if response.status_code == 200:
                                data = response.json()
                                chunk_translated = data.get("translated_text")
                                if chunk_translated:
                                    translated_chunks.append(chunk_translated)
                                else:
                                    has_error = True
                                    break
                            else:
                                logger.warning(f"Sarvam Translate chunk failed: {response.status_code} {response.text}")
                                has_error = True
                                break
                                
                        if not has_error and translated_chunks:
                            logger.info(f"Successfully translated using Sarvam AI chunks")
                            return " ".join(translated_chunks)
                        logger.warning(f"Sarvam Translate completely failed, falling back to Google Translate.")
            except Exception as e:
                logger.warning(f"Sarvam translation exception: {str(e)}, falling back to Google Translate.")

        # Fallback to Google Translate
        try:
            source_code = self.LANGUAGE_CODES.get(source_language, "en")
            target_code = self.LANGUAGE_CODES.get(target_language, "en")
            
            # Use Google Translate API via simple HTTP request
            async with httpx.AsyncClient() as client:
                encoded_text = urllib.parse.quote(text)
                translate_url = f"https://translate.google.com/translate_a/single?client=gtx&sl={source_code}&tl={target_code}&dt=t&q={encoded_text}"
                
                response = await client.get(translate_url, timeout=self.timeout)
                
                if response.status_code == 200:
                    import json
                    try:
                        data = response.json()
                        # Extract translated text from nested array
                        if data and data[0]:
                            translated_text = ""
                            for item in data[0]:
                                if item[0]:
                                    translated_text += item[0]
                            logger.info(f"Successfully translated using Google Translate fallback")
                            return translated_text if translated_text else text
                    except Exception as e:
                        logger.warning(f"Error parsing translation response: {e}")
            
            return text
        except Exception as e:
            logger.warning(f"Translation error: {e}")
            return text
    
    async def translate_to_english(self, 
                                  text: str, 
                                  source_language: str) -> str:
        """
        Translate text from any language to English
        
        Args:
            text: Text to translate
            source_language: Source language name
            
        Returns:
            English translation
        """
        return await self.translate(text, "English", source_language)
    
    async def translate_from_english(self, 
                                    text: str, 
                                    target_language: str) -> str:
        """
        Translate text from English to target language
        
        Args:
            text: English text to translate
            target_language: Target language name
            
        Returns:
            Translated text
        """
        return await self.translate(text, target_language, "English")
    
    def is_available(self) -> bool:
        """Check if translation service is available"""
        return self.available


# Global singleton instance
_translation_service = None

def get_translation_service() -> TranslationService:
    """Get or initialize translation service (singleton)"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service
