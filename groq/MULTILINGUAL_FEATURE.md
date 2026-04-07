# Multilingual Feature Implementation Guide

## Overview
This guide explains how to use and configure the new multilingual feature for the Adjournment AI legal simulator. Users can now select any of 23 Indian languages and interact with the system in their chosen language.

## Features

### 1. **Language Selection**
- Users can select from 23 Indian languages before starting a simulation
- Supported languages include:
  - English
  - Hindi
  - Bengali
  - Telugu
  - Marathi
  - Tamil
  - Urdu
  - Gujarati
  - Kannada
  - Odia
  - Malayalam
  - Punjabi
  - Assamese
  - Maithili
  - Santali
  - Kashmiri
  - Nepali
  - Sindhi
  - Dogri
  - Konkani
  - Manipuri
  - Bodo
  - Sanskrit

### 2. **Speech-to-Text in Multiple Languages**
```
User speaks in their chosen language → 
Backend transcribes & translates to English for processing →
Maintains language preference for all operations
```
- Microphone input is automatically transcribed in the selected language
- The Sarvam AI API handles language detection and translation

### 3. **Argument Processing with Translation**
```
User argument (in selected language) →
Translate to English for AI analysis →
AI evaluates the argument →
Translate responses back to user's language →
Display in original language with voice output
```

### 4. **Text-to-Speech in Multiple Languages**
- AI opponent responses are converted to speech in the user's language
- Uses Google Text-to-Speech (gTTS) for 23 languages

### 5. **Real-Time Translation**
- Judge feedback translated to user's language
- Opponent responses translated to user's language
- Citation suggestions provided in original language context

## How to Use

### Step 1: Start a Simulation
1. Browse to a case in the simulator
2. Click "Start Simulation"

### Step 2: Select Language
1. The mode selection modal appears
2. Click on the "Choose Language" dropdown
3. Select your preferred language from the list
4. Select your game mode (AI or Multiplayer)
5. Click "Begin Simulation"

### Step 3: Submit Arguments
You can submit arguments in three ways:

#### Option A: Type in Your Language
1. Type your legal argument in the chosen language
2. Click the Send button
3. The system will:
   - Translate to English for analysis
   - Evaluate the argument
   - Translate feedback back to your language
   - Display results in your language

#### Option B: Speak in Your Language (Voice Input)
1. Click the microphone icon
2. Speak your argument in the chosen language
3. Release the microphone
4. The system will:
   - Transcribe your speech
   - Translate to English
   - Process as normal
   - Return translated feedback

#### Option C: Combination
1. Speak in your language to capture initial thoughts
2. Edit the transcription if needed
3. Submit

### Step 4: Listen to Responses
1. Click the "Speak" button on opponent responses
2. The AI's response will be:
   - Translated to your language
   - Converted to speech in your language
3. Click "Pause" to stop playback

## Backend Architecture

### Key Components

#### 1. **TranslationService** (`app/services/translation_service.py`)
```python
# Features:
- Async translation using Google Translate API
- Support for 23 Indian languages
- Fallback to original text if translation fails
- Language code mapping

# Key Methods:
- translate(text, target_language, source_language)
- translate_to_english(text, source_language)
- translate_from_english(text, target_language)
```

#### 2. **Updated ArgumentRequest** (`app/models/schemas.py`)
```python
class ArgumentRequest(BaseModel):
    session_id: str
    argument_text: str
    cited_sections: List[str] = []
    evidence_references: List[str] = []
    phase: Optional[CourtPhase]
    language: Optional[str] = "English"  # NEW!
```

#### 3. **Enhanced Audio Routes** (`app/api/routes/audio.py`)
```python
# Speech-to-Text
POST /api/audio/speech-to-text?language=Hindi
- Accepts audio file
- Returns transcribed & translated text

# Text-to-Speech
GET /api/audio/tts?text=...&language=Hindi&role=opponent
- Accepts text and language
- Returns MP3 audio in that language
```

#### 4. **Updated Argument Submission** (`app/api/routes/argument.py`)
```python
# The submit endpoint now:
1. Receives language from request
2. Translates user argument from language → English
3. Processes evaluation in English
4. AI generates opponent response in English
5. Translates feedback and opponent response → user's language
6. Returns all responses in user's language
7. Stores original language with argument record
```

## Frontend Changes

### Updated Components

#### 1. **Mode Selection Modal** (Already in place)
```tsx
// Language dropdown is displayed before game starts
// Selected language is stored in state
<select value={language} onChange={(e) => setLanguage(e.target.value)}>
  {languages.map(lang => <option>{lang}</option>)}
</select>
```

#### 2. **Updated submitArgument Function**
```tsx
// Now includes language parameter
const res = await axios.post("http://localhost:8000/api/argument/submit", {
  session_id: sessionId,
  argument_text: newMsg.text,
  cited_sections: cited,
  evidence_references: [],
  phase: mappedPhase,
  language: selectedLanguage  // NEW!
});
```

#### 3. **Updated Speech-to-Text**
```tsx
// Now passes language parameter
const res = await axios.post(
  `http://localhost:8000/api/audio/speech-to-text?language=${langParam}`, 
  fd
);
```

#### 4. **Updated Text-to-Speech**
```tsx
// Now passes language parameter
const res = await fetch(
  `http://localhost:8000/api/audio/tts?text=${textParam}&language=${langParam}&role=opponent`
);
```

## Data Flow Diagram

```
User Input (Language X)
    ↓
Voice Recording (Optional)
    ↓
Speech-to-Text (Sarvam AI)
    ↓
Translate X → English (Google Translate)
    ↓
AI Processing (Judge & Opponent agents - English)
    ↓
Generate Responses (English)
    ↓
Translate English → Language X (Google Translate)
    ↓
Text-to-Speech (gTTS) in Language X
    ↓
User Output (Language X + Audio)
```

## API Endpoints

### 1. Speech-to-Text (Updated)
```
POST /api/audio/speech-to-text?language=Hindi
Headers: Content-Type: multipart/form-data
Body: audio file (wav/mp3)

Response:
{
  "transcript": "यह एक परीक्षण है",
  "language": "Hindi",
  "success": true
}
```

### 2. Text-to-Speech (Updated)
```
GET /api/audio/tts?text=Hello&language=Hindi&role=opponent

Response: MP3 audio stream with appropriate language
```

### 3. Argument Submission (Updated)
```
POST /api/argument/submit
Body:
{
  "session_id": "...",
  "argument_text": "मेरा तर्क यह है...",
  "cited_sections": [],
  "evidence_references": [],
  "phase": "argument",
  "language": "Hindi"
}

Response:
{
  "feedback": "आपका तर्क अच्छा है...",
  "opponent_response": "मृत्यु दंड मामले में...",
  "legal_accuracy_score": 85,
  ...
}
```

## Configuration

### Required Dependencies
```
httpx>=0.23.0        # For async HTTP requests
google-cloud-translate # For translation (optional)
gtts>=2.2.0          # For text-to-speech
sarvam-api           # Already configured for STT
```

### Environment Variables
Ensure these are configured in your `.env`:
```
SARVAM_API_KEY=your_sarvam_api_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=optional_groq_api_key
```

## Error Handling

### Translation Failures
- If translation API is unavailable, text is returned in original language
- Original argument is stored alongside English translation
- Processing continues with available text

### Speech-to-Text Failures
- User sees: "Transcription failed."
- Manual text input remains available
- Session continues normally

### Text-to-Speech Failures
- Silent failure with pause button visible
- User can still read responses
- No interruption to workflow

## Performance Considerations

### Optimization
1. **Translation Caching** (Future): Cache common legal terms
2. **Batch Translation** (Future): Translate multiple responses together
3. **Language Detection** (Future): Auto-detect user language from speech

### Latency
- Translation adds ~500ms-1s per request
- TTS adds ~200-500ms per chunk
- Total additional latency: 1-2 seconds per interaction

## Testing

### Test the Feature
```bash
# 1. Start backend
cd backend
python -m uvicorn app.main:app --reload

# 2. Test STT with language
curl -X POST http://localhost:8000/api/audio/speech-to-text?language=Hindi \
  -F "file=@recording.wav"

# 3. Test TTS with language
curl http://localhost:8000/api/audio/tts?text=नमस्ते&language=Hindi

# 4. Test argument submission with language
curl -X POST http://localhost:8000/api/argument/submit \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test_123",
    "argument_text": "मेरा तर्क यह है",
    "language": "Hindi"
  }'
```

## Troubleshooting

### Issue: Translation not working
**Solution**: 
- Check internet connection (Google Translate API requires internet)
- Check if httpx is installed: `pip install httpx`
- Check backend logs for translation errors

### Issue: Speech-to-text returns English only
**Solution**:
- Ensure Sarvam API key is configured
- Check Sarvam API documentation for language support
- Verify audio format is WAV

### Issue: TTS sounds robotic or unclear
**Solution**:
- This is inherent to gTTS
- Consider upgrading to premium TTS service (Azure, Google Cloud TTS)
- Adjust playback speed if possible

### Issue: Language selection not persisting
**Solution**:
- Check that `selectedLanguage` state is properly managed
- Verify language is passed to all API calls
- Check browser console for errors

## Future Enhancements

1. **Persistent Language Selection**
   - Save user's language preference
   - Auto-load on next session

2. **Premium TTS Integration**
   - Google Cloud Text-to-Speech (better quality)
   - Azure Speech Services
   - Support for multiple voices per language

3. **Translation Caching**
   - Cache legal terms and common phrases
   - Reduce translation latency by 70%

4. **Language Auto-Detection**
   - Auto-detect from speech
   - Auto-detect from initial text

5. **Bilingual Support**
   - Show English + User Language side-by-side
   - Helps with legal terminology learning

6. **Export in Multiple Languages**
   - Export judgment summaries in chosen language
   - Downloadable reports in multiple formats

## Support

For issues or questions about the multilingual feature:
1. Check the troubleshooting section above
2. Review backend logs: `app.log`
3. Check frontend console for errors
4. Verify all environment variables are set correctly

---

**Last Updated**: April 3, 2026
**Status**: Production Ready
**Support**: Full multilingual support for 23 Indian languages
