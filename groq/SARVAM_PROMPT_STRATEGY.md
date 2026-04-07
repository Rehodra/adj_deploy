# Sarvam API — AI Assistant Prompt: Implementation Strategy

> This document explains the reasoning, structure, and decisions behind the **SarvamDev Assistant** system prompt — a knowledge-grounded AI prompt for answering Sarvam API developer questions across pricing, implementation, and debugging.

---

## 1. What Problem This Prompt Solves

Developers integrating the Sarvam API face three recurring pain points:

- **Wrong implementation choices** — picking the wrong TTS mode (REST vs HTTP Stream vs WebSocket), wrong speaker for a language, wrong audio codec for their use case
- **Silent quality degradation** — using Romanized/transliterated Indic input instead of native script, which doesn't throw an error but severely degrades TTS output
- **Confusing rate limit / pricing structure** — three concurrency modes, per-API limits, and plan-level limits that all interact

A generic LLM without grounded knowledge will hallucinate endpoints, invent pricing, and give plausible-but-wrong speaker recommendations. This prompt prevents that.

---

## 2. Source Material

Three documentation files were used as the knowledge base:

| File | What It Contains |
|---|---|
| `rate_sarvam.txt` | Pricing per service, plan tiers, rate limits per API and concurrency mode |
| `API-implementations.txt` | TTS REST, HTTP Stream, WebSocket code examples, audio formats, error codes, pronunciation dictionary |
| `setup-guide.txt` | Language codes, voice/speaker selection with CER quality tiers, sample rates, loudness, output codecs, known limitations |

---

## 3. Strategy: Why Each Section Was Included

### 3.1 Persona Definition — "SarvamDev Assistant"

**Decision:** Give the AI a named, role-specific identity.

**Why:** A named persona with a defined job ("expert technical support engineer") sets the register for answers. It signals: be precise, be code-first, don't hedge unnecessarily. A generic "helpful assistant" persona produces vaguer, more cautious answers. Developer tooling prompts benefit from a confident, direct persona.

---

### 3.2 Structured Knowledge Base (not raw docs)

**Decision:** Convert all three files into normalized, tabular reference sections inside the prompt rather than pasting raw text.

**Why:** Raw documentation has narrative prose, repetition, and inconsistent formatting. A structured table is faster for an LLM to retrieve from accurately. For example, the rate limits section of the original docs lists Starter/Pro/Business values across many paragraphs — the prompt consolidates these into a single table per API, making it far less likely the model confuses Starter burst limits with Business provisioned limits.

**Sections structured this way:**
- Pricing → single reference table
- Plans → tier comparison table
- Rate limits → one table per API type
- Speakers → CER tier table + language-specific recommendations table
- Sample rates → availability matrix
- Error codes → HTTP status + cause + fix table

---

### 3.3 The "varun Warning" — Special Case Flagging

**Decision:** Explicitly flag the `varun` speaker as a special-use-only voice with a hard rule: *never recommend for neutral use*.

**Why:** `varun` has a 0.06% CER — the second lowest of all male speakers — which makes it statistically look like the best male choice. An LLM without the warning would likely recommend it as a top pick. The docs note it carries a "deep, dramatic villain/suspense character" — a detail that would be lost in a generic summary. This is exactly the kind of nuanced, non-obvious constraint that needs to be explicitly surfaced.

---

### 3.4 The Romanized Indic Input Warning — Critical Bug Prevention

**Decision:** Promote the "use native script" rule from a note buried in the limitations section to a **top-level behavioral rule** in the "How to Answer" section, and label it the most common production error.

**Why:** The docs themselves call this "the most common integration mistake." It doesn't produce an error — the API accepts the request and returns audio — but the quality degrades significantly. A developer won't realize the problem from logs alone. The prompt instructs the AI to actively flag this whenever it sees transliterated Indic text in user-submitted code, not just mention it when asked.

---

### 3.5 Vision/Document Intelligence Rate Limit Exception

**Decision:** Add an explicit rule: "Vision limits do NOT increase with plan upgrades."

**Why:** Every other API in the platform has higher limits at higher plan tiers. Vision is the only exception — limits are uniform across Starter, Pro, and Business. This is counterintuitive and is a likely source of frustration for developers who upgrade their plan expecting Vision throughput to improve. Making this a named rule (not just a table note) ensures the AI proactively mentions it when Vision rate limits come up.

---

### 3.6 TTS Mode Selection Decision Tree

**Decision:** Include a comparison table for REST vs HTTP Stream vs WebSocket with "Use X when" guidance.

**Why:** The three TTS modes have overlapping use cases and non-obvious tradeoffs:
- HTTP Stream has a *higher* character limit (3,500) than REST (2,500) or WebSocket (2,500/message)
- WebSocket requires a handshake + config message before any text, making it overkill for one-shot generation
- Serverless/edge environments can't use WebSocket but HTTP Stream works fine

Without this structure, an AI would likely default to recommending REST for everything, missing the valid cases for streaming modes.

---

### 3.7 Language-Specific Speaker Recommendations (not just overall CER)

**Decision:** Include the full language × speaker recommendation matrix, not just the global CER tier rankings.

**Why:** `mani` has the best overall CER (0.00%) but is primarily recommended for Punjabi. `ratan` has a higher CER (0.33%) but is the recommended male voice for English, Tamil, Marathi, and Gujarati. A prompt that only surfaces CER rankings would consistently suggest `mani` for all languages — which is wrong. The language-specific table is the ground truth for production recommendations.

---

### 3.8 Behavioral Rules (the "How to Answer" Section)

**Decision:** Add 8 explicit behavioral rules separate from the knowledge base.

**Why:** Knowledge alone doesn't control answer behavior. The rules layer handles:

| Rule | What it prevents |
|---|---|
| "Be direct and specific" | Vague hedging ("it depends on your use case...") |
| "Always show code" | Text-only answers to implementation questions |
| "Flag Romanized Indic input" | Silent quality bugs passing undetected |
| "Match plan to use case" | Developer under/over-buying plan tiers |
| "Never guess" | Hallucinated endpoints or features |
| "Never recommend varun as default" | Inappropriate voice for neutral content |
| "Vision limits are fixed" | Incorrect expectations after plan upgrade |
| "Ask for error code first" | Wasted diagnosis rounds without key info |

---

### 3.9 The "Do Not Guess" Rule

**Decision:** Explicitly instruct the AI to say "I don't have that detail" and point to official docs rather than extrapolate.

**Why:** LLMs are prone to confident confabulation, especially for API parameters and pricing. A wrong answer about pricing or an invented endpoint wastes developer time and erodes trust. A clear instruction to acknowledge knowledge gaps — with a redirect to `docs.sarvam.ai` — is safer than an attempt to infer from partial information.

---

## 4. What Was Deliberately Left Out

Some information from the source docs was omitted from the prompt:

| Omitted | Reason |
|---|---|
| Raw code listings (full WebSocket flow, batch polling loop) | These are too long for the prompt; the AI generates working code from the parameters and patterns documented |
| Pronunciation dictionary limits per language (not documented) | Not in source material; no entry prevents hallucination better than silence |
| Bulbul v2 speaker CER ratings | v2 CER ratings were not in the source docs; only v3 ratings were provided |
| Dashboard UI instructions | Out of scope for an API support assistant |

---

## 5. How to Extend This Prompt

To add new Sarvam APIs (e.g., STT detailed implementation, Vision API code examples):

1. Add a new numbered section to the **Knowledge Base** with the same tabular format
2. If the API has a non-obvious behavior or common mistake, add it to the **Known Limitations** section
3. If it requires a new behavioral rule (e.g., "always ask for audio file duration before recommending STT plan"), add it to **How to Answer**
4. Do not add raw prose — convert everything to tables or structured lists before inserting

---

## 6. Quick Reference: Prompt Architecture

```
[Persona]
  └── Named role, communication style, directness expectation

[Knowledge Base]
  ├── Section 1:  Pricing table
  ├── Section 2:  Plans + rate limits (account-level)
  ├── Section 3:  Concurrency modes explained
  ├── Section 4:  Per-API rate limits (STT, TTS, Translation, LLM, Vision)
  ├── Section 5:  TTS language codes
  ├── Section 6:  TTS voices + CER tiers + language-specific picks
  ├── Section 7:  TTS audio config (sample rate, loudness, pace, codecs, mode selection)
  ├── Section 8:  Pronunciation dictionary
  ├── Section 9:  Known limitations
  ├── Section 10: Translation code example
  └── Section 11: Error codes

[Behavioral Rules]
  ├── Be direct, code-first
  ├── Flag Romanized Indic input (critical bug)
  ├── Match plan recommendation to use case
  ├── Never guess — redirect to docs
  ├── Never recommend varun as neutral voice
  ├── Always note Vision limits are plan-invariant
  └── Ask for error code before diagnosing
```

---

*Strategy authored for the SarvamDev Assistant prompt — April 2026*
