# API Testing Guide - AI Legal Courtroom Simulator

## 🚀 Quick Start

1. **Start the server** (if not already running):
   ```bash
   uv run --python .venv-new\Scripts\python.exe uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Open API Documentation**: http://localhost:8000/docs

---

## 📋 Step-by-Step Testing Guide

### Step 1: Health Check (Verify Server is Running)

**Endpoint**: `GET /health`

**Method**: 
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-20T19:41:23.002684",
  "version": "1.0.0",
  "environment": "development"
}
```

---

### Step 2: Create a New Courtroom Session

**Endpoint**: `POST /api/session/create`

**Swagger UI Testing**:
1. Go to http://localhost:8000/docs
2. Find `POST /api/session/create` endpoint
3. Click "Try it out"
4. Copy and paste this JSON into the request body:

```json
{
  "case_id": "CRIM_EASY_1",
  "user_id": "law_student_001",
  "mode": "criminal"
}
```

**cURL Command**:
```bash
curl -X POST "http://localhost:8000/api/session/create" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "CRIM_EASY_1",
    "user_id": "law_student_001",
    "mode": "criminal"
  }'
```

**Expected Response**:
```json
{
  "session_id": "session_123456789",
  "case_id": "CRIM_EASY_1",
  "user_id": "law_student_001",
  "mode": "criminal",
  "phase": "opening_statements",
  "created_at": "2026-03-20T19:45:00.000Z",
  "status": "active"
}
```

**Note**: Copy `session_id` from response - you'll need it for subsequent tests.

---

### Step 3: Get Session Details

**Endpoint**: `GET /api/session/{session_id}`

**Swagger UI Testing**:
1. Find `GET /api/session/{session_id}` endpoint
2. Enter your `session_id` from Step 2
3. Click "Execute"

**cURL Command** (replace `session_123456789` with your actual session_id):
```bash
curl "http://localhost:8000/api/session/session_123456789"
```

**Expected Response**:
```json
{
  "session_id": "session_123456789",
  "case_id": "CRIM_EASY_1",
  "user_id": "law_student_001",
  "mode": "criminal",
  "phase": "opening_statements",
  "created_at": "2026-03-20T19:45:00.000Z",
  "status": "active",
  "case_facts": {
    "title": "State of Karnataka vs. Arjun Mehta - Chain Snatching Case",
    "type": "criminal",
    "sections": ["379", "356"],
    "summary": "Case involving a chain snatching on the street with CCTV footage."
  }
}
```

---

### Step 4: Submit an Opening Statement

**Endpoint**: `POST /api/argument/submit`

**Swagger UI Testing**:
1. Find `POST /api/argument/submit` endpoint
2. Click "Try it out"
3. Copy and paste this JSON into the request body:

```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "argument_text": "Your Honor, the prosecution has failed to establish beyond reasonable doubt that the accused committed the offense under Section 302 IPC. The evidence presented is circumstantial and lacks the necessary corroboration required for a conviction. As per the principles established in State of Rajasthan v. Kashi Ram, the burden of proof rests heavily on the prosecution, which has not been satisfactorily discharged in this case.",
  "cited_sections": ["302", "300", "304"],
  "phase": "opening_statement"
}
```

**cURL Command**:
```bash
curl -X POST "http://localhost:8000/api/argument/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "YOUR_SESSION_ID_HERE",
    "argument_text": "Your Honor, the prosecution has failed to establish beyond reasonable doubt that the accused committed the offense under Section 302 IPC. The evidence presented is circumstantial and lacks the necessary corroboration required for a conviction. As per the principles established in State of Rajasthan v. Kashi Ram, the burden of proof rests heavily on the prosecution, which has not been satisfactorily discharged in this case.",
    "cited_sections": ["302", "300", "304"],
    "phase": "opening_statements"
  }'
```

**Expected Response**:
```json
{
  "argument_id": "arg_123456789",
  "session_id": "YOUR_SESSION_ID_HERE",
  "evaluation": {
    "overall_score": 78,
    "legal_accuracy": 32,
    "reasoning": 28,
    "evidence": 18,
    "feedback": "Strong opening statement with good legal citations. Consider strengthening evidentiary analysis.",
    "performance_tier": "Competent Advocate"
  },
  "opponent_response": {
    "response_text": "Your Honor, defense counsel overlooks critical forensic evidence that directly links the accused to the crime scene. The blood-stained weapon found in the accused's possession, bearing DNA matching the victim, constitutes compelling evidence under Section 27 of the Indian Evidence Act.",
    "strategy": "evidence_focus",
    "counter_points": ["Forensic evidence", "DNA matching", "possession of weapon"]
  },
  "timestamp": "2026-03-20T19:47:00.000Z"
}
```

---

### Step 5: Submit a Main Argument

**Endpoint**: `POST /api/argument/submit`

**Swagger UI Testing**:
1. Use the same `POST /api/argument/submit` endpoint
2. Copy and paste this JSON:

```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "argument_text": "Your Honor, Section 300 of the IPC defines murder as culpable homicide with the intention of causing death. The prosecution has not demonstrated any such intention on the part of the accused. The alleged motive remains unproven, and the timeline of events suggests the accused was not present at the scene of the crime. Furthermore, the witness testimonies contain material inconsistencies that undermine their credibility.",
  "cited_sections": ["300", "302", "3"],
  "phase": "argument"
}
```

**cURL Command**:
```bash
curl -X POST "http://localhost:8000/api/argument/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "YOUR_SESSION_ID_HERE",
    "argument_text": "Your Honor, Section 300 of the IPC defines murder as culpable homicide with the intention of causing death. The prosecution has not demonstrated any such intention on the part of the accused. The alleged motive remains unproven, and the timeline of events suggests the accused was not present at the scene of the crime. Furthermore, the witness testimonies contain material inconsistencies that undermine their credibility.",
    "cited_sections": ["300", "302", "3"],
    "phase": "arguments"
  }'
```

**Expected Response**:
```json
{
  "argument_id": "arg_123456790",
  "session_id": "YOUR_SESSION_ID_HERE",
  "evaluation": {
    "overall_score": 82,
    "legal_accuracy": 35,
    "reasoning": 30,
    "evidence": 17,
    "feedback": "Excellent legal analysis with precise statutory interpretation. Could benefit from more detailed examination of witness credibility standards.",
    "performance_tier": "Competent Advocate"
  },
  "opponent_response": {
    "response_text": "Your Honor, the defense attempts to create artificial doubt by focusing on minor procedural details while ignoring the substantive evidence. The accused's presence at the crime scene is established through multiple independent witnesses, and the motive is clearly demonstrated through prior threats made to the deceased.",
    "strategy": "prosecution_focus",
    "counter_points": ["Witness testimony", "Motive evidence", "Prior threats"]
  },
  "timestamp": "2026-03-20T19:49:00.000Z"
}
```

---

### Step 6: Get Argument History

**Endpoint**: `GET /api/argument/{session_id}/history`

**Swagger UI Testing**:
1. Find `GET /api/argument/{session_id}/history` endpoint
2. Enter your `session_id`
3. Click "Execute"

**cURL Command**:
```bash
curl "http://localhost:8000/api/argument/YOUR_SESSION_ID_HERE/history"
```

**Expected Response**:
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "arguments": [
    {
      "argument_id": "arg_123456789",
      "phase": "opening_statements",
      "argument_text": "Your Honor, prosecution has failed to establish...",
      "evaluation": {
        "overall_score": 78,
        "performance_tier": "Competent Advocate"
      },
      "timestamp": "2026-03-20T19:47:00.000Z"
    },
    {
      "argument_id": "arg_123456790",
      "phase": "arguments",
      "argument_text": "Your Honor, Section 300 of the IPC defines murder...",
      "evaluation": {
        "overall_score": 82,
        "performance_tier": "Competent Advocate"
      },
      "timestamp": "2026-03-20T19:49:00.000Z"
    }
  ],
  "total_arguments": 2
}
```

---

### Step 7: Get Performance Analytics

**Endpoint**: `GET /api/argument/{session_id}/analytics`

**Swagger UI Testing**:
1. Find `GET /api/argument/{session_id}/analytics` endpoint
2. Enter your `session_id`
3. Click "Execute"

**cURL Command**:
```bash
curl "http://localhost:8000/api/argument/YOUR_SESSION_ID_HERE/analytics"
```

**Expected Response**:
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "analytics": {
    "total_arguments": 2,
    "average_score": 80.0,
    "highest_score": 82,
    "lowest_score": 78,
    "performance_tier": "Competent Advocate",
    "skill_breakdown": {
      "legal_accuracy": 33.5,
      "reasoning": 29.0,
      "evidence": 17.5
    },
    "improvement_suggestions": [
      "Focus on strengthening evidentiary analysis",
      "Practice citing more specific case law",
      "Work on argument structure and flow"
    ],
    "progress_trend": "improving"
  }
}
```

---

### Step 8: Update Session Phase

**Endpoint**: `PUT /api/session/{session_id}/phase`

**Swagger UI Testing**:
1. Find `PUT /api/session/{session_id}/phase` endpoint
2. Enter your `session_id`
3. Copy and paste this JSON:

```json
{
  "phase": "cross_examination"
}
```

**cURL Command**:
```bash
curl -X PUT "http://localhost:8000/api/session/YOUR_SESSION_ID_HERE/phase" \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "cross_examination"
  }'
```

**Expected Response**:
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "previous_phase": "arguments",
  "current_phase": "cross_examination",
  "updated_at": "2026-03-20T19:51:00.000Z"
}
```

---

### Step 9: Submit Feedback

**Endpoint**: `POST /api/argument/{session_id}/feedback`

**Swagger UI Testing**:
1. Find `POST /api/argument/{session_id}/feedback` endpoint
2. Enter your `session_id`
3. Copy and paste this JSON:

```json
{
  "argument_id": "arg_123456790",
  "rating": 4,
  "comments": "Very helpful feedback on legal accuracy. The opponent response was challenging and realistic.",
  "helpful": true
}
```

**cURL Command**:
```bash
curl -X POST "http://localhost:8000/api/argument/YOUR_SESSION_ID_HERE/feedback" \
  -H "Content-Type: application/json" \
  -d '{
    "argument_id": "arg_123456790",
    "rating": 4,
    "comment": "Very helpful feedback on legal accuracy. The opponent response was challenging and realistic.",
    "helpful": true
  }'
```

**Expected Response**:
```json
{
  "feedback_id": "feedback_123456789",
  "argument_id": "arg_123456790",
  "session_id": "YOUR_SESSION_ID_HERE",
  "rating": 4,
  "helpful": true,
  "timestamp": "2026-03-20T19:53:00.000Z"
}
```

---

### Step 10: Explore Available Cases (New API Routes)

**Endpoint 1: Get Case Types & Difficulties**  
`GET /api/cases/types`

**cURL Command**:
```bash
curl "http://localhost:8000/api/cases/types"
```

**Expected Response**:
```json
{
  "types": [
    "criminal",
    "civil",
    "constitutional"
  ],
  "difficulties": [
    "easy",
    "medium",
    "hard"
  ]
}
```

**Endpoint 2: List Cases (with optional filtering)**  
`GET /api/cases/list?type=criminal&difficulty=easy`

**cURL Command**:
```bash
curl "http://localhost:8000/api/cases/list?type=criminal&difficulty=easy"
```

**Expected Response**:
```json
[
  {
    "id": "CRIM_EASY_1",
    "title": "State of Karnataka vs. Arjun Mehta - Chain Snatching Case",
    "type": "criminal",
    "difficulty": "easy"
  },
  {
    "id": "CRIM_EASY_2",
    "title": "State of Maharashtra vs. Vikram Yadav - Bar Brawl Assault",
    "type": "criminal",
    "difficulty": "easy"
  }
]
```

**Endpoint 3: Get Specific Case Details**  
`GET /api/cases/{case_id}`

**cURL Command** (replace with actual case ID):
```bash
curl "http://localhost:8000/api/cases/CRIM_EASY_1"
```

**Expected Response**:
```json
{
  "id": "CRIM_EASY_1",
  "title": "State of Karnataka vs. Arjun Mehta - Chain Snatching Case",
  "type": "criminal",
  "difficulty": "easy",
  "laws_invoked": [
    "IPC 379"
  ],
  "location": "Indiranagar, Bangalore"
}
```

---

## 🧪 Advanced Testing Scenarios

### Test Case 1: Weak Legal Argument

**Input for Swagger UI**:
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "argument_text": "The accused is innocent because he seems like a good person and has no criminal record.",
  "cited_sections": [],
  "phase": "arguments"
}
```

**Expected**: Low score (40-55) with feedback about lack of legal basis

### Test Case 2: Strong Legal Argument

**Input for Swagger UI**:
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "argument_text": "Your Honor, under Section 29 of the Indian Evidence Act, 'facts which are the occasion, cause or effect, immediate or remote, of relevant facts, or facts in issue, or which constitute the state of things under which they happened, or which afforded an opportunity for their occurrence or transaction, are relevant'. The prosecution's evidence fails to establish the basic ingredients of Section 302 IPC as established in the landmark case of State of U.P. v. Madan Mohan, where the Supreme Court held that mere suspicion cannot replace the requirement of proof beyond reasonable doubt.",
  "cited_sections": ["29", "302", "101"],
  "phase": "arguments"
}
```

**Expected**: High score (80-95) with positive feedback

### Test Case 3: Cross-Examination Phase

**Input for Swagger UI**:
```json
{
  "session_id": "YOUR_SESSION_ID_HERE",
  "argument_text": "Your Honor, I wish to cross-examine the witness regarding their statement about seeing the accused at the crime scene. Given that the witness admitted to being 200 meters away and visibility was poor due to fog, how can they positively identify the accused?",
  "cited_sections": ["3", "135"],
  "phase": "cross_examination"
}
```

---

## 🔧 Troubleshooting

### Common Issues:

1. **404 Error**: Check if server is running and URL is correct
2. **422 Error**: JSON format is incorrect - check for missing quotes or commas
3. **500 Error**: Server error - check server logs for details
4. **CORS Error**: Make sure frontend URL is in CORS_ORIGINS list

### Debug Tips:

- Use the interactive API docs at **http://localhost:8000/docs** - This is the easiest way to test!
- Check the server console for error messages
- Verify `session_id` is valid and from a previous session creation
- Ensure all required fields are included in JSON requests

---

## 📱 Using Interactive API Docs (Recommended)

1. **Open**: http://localhost:8000/docs
2. **Click** on any endpoint to expand it
3. **Click** "Try it out" button
4. **Fill in** required parameters with the JSON examples provided above
5. **Click** "Execute" to test
6. **View** response below

This is the easiest way to test APIs without using curl!

---

## 🎯 Quick Test Workflow

1. **Health Check**: http://localhost:8000/health
2. **Create Session**: Use Step 2 JSON in Swagger UI
3. **Submit Argument**: Use Step 4 JSON in Swagger UI  
4. **Check Results**: Review evaluation and opponent response

**Pro Tip**: Always copy the `session_id` from the session creation response - you'll need it for all subsequent tests!
