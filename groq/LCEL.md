## What is LCEL and What Does It Do Here?

---

### LCEL = LangChain Expression Language

It's LangChain's way of **chaining AI operations together using the `|` pipe operator** — just like Unix pipes, but for LLM steps.

The fundamental idea:
```python
output = step_A | step_B | step_C
```
The output of A flows as input to B, B's output flows to C, and so on. Each step is called a **Runnable**.

---

### In Your `lcel_pipeline.py` — Step by Step

Here's what your chain actually does when `pipeline.invoke("What are exceptions to murder under IPC?")` is called:

```python
# Step 1: Retrieval Chain
retrieval_chain = {
    "context": self.retriever | self.format_docs,  # ← fetch docs, format them
    "question": RunnablePassthrough()               # ← pass the query through unchanged
}

# Step 2: Reasoning Chain  
reasoning_chain = retrieval_chain | self.judge_prompt | self.llm | StrOutputParser()

# Step 3: Validation Chain
validation_chain = {"response": reasoning_chain} | self.citation_prompt | self.llm | StrOutputParser()
```

Let me trace the data flow visually:

```
User: "What are exceptions to murder under IPC?"
         │
         ├──────────────────────────────────────┐
         │                                      │ RunnablePassthrough()
         ▼                                      │ (query goes through unchanged)
  CustomLegalRetriever                          │
  (orchestrator: stage1+stage2)                 │
         │                                      │
         ▼                                      │
  format_docs()                                 │
  → "=== IPC §300 Exception 1 ===\n..."        │
         │                                      │
         └──────────────────────┐               │
                                ▼               ▼
                         judge_prompt fills in:
                         {context} ← formatted legal chunks
                         {question} ← original query
                                │
                                ▼
                         Gemini LLM generates:
                         "Under IPC §300, Exception 1 states..."
                                │
                                ▼
                         StrOutputParser()
                         → plain string response
                                │
                                ▼
                  citation_prompt fills in:
                  {response} ← the judge's answer above
                                │
                                ▼
                         Gemini LLM validates:
                         "✅ IPC §300 cited correctly
                          ⚠️ Exception 2 not mentioned"
                                │
                                ▼
                  Final verified output to your API
```

---

### The Two Prompts Explained

**Prompt 1 — Judge Prompt (Generation)**
```python
judge_prompt = ChatPromptTemplate.from_template("""
You are an AI Judge in an Indian courtroom simulator.
Use ONLY the retrieved legal sections below.

Context: {context}   ← your 5 reranked legal chunks go here
Question: {question} ← the user's query goes here
...
""")
```
This is where the actual **legal reasoning happens**. The LLM produces an answer grounded strictly in the retrieved chunks.

---

**Prompt 2 — Citation Prompt (Validation)**
```python
citation_prompt = ChatPromptTemplate.from_template("""
Validate the following response for:
- correct legal section references
- citation continuity
- exception/proviso completeness

Response: {response}  ← the judge's answer from Prompt 1
""")
```
This **second LLM call** reads the judge's answer and checks whether:
- The sections it cited actually exist in context
- It didn't invent any sections (hallucination)
- It mentioned all relevant exceptions/provisos

---

### Why This Matters vs. a Single Prompt

| Approach | Problem |
|---|---|
| **Single prompt RAG** | LLM generates and nobody checks — may hallucinate §999 |
| **Your 2-stage LCEL** | LLM generates *then* a second LLM pass verifies the citations |

It's like having a **lawyer write the argument, then a reviewer check the citations** before it goes to court.

---

### The `RunnablePassthrough()` Bit

This is just LCEL's way of saying *"don't transform this input, pass it as-is"*:

```python
{"context": retriever | format_docs,  # ← transform query → docs → string
 "question": RunnablePassthrough()}   # ← keep query exactly as typed
```

Without it, the query would get consumed by the retriever and never reach the `{question}` slot in the prompt.

---

### TL;DR for the Hackathon Demo

> *"We use a two-stage LCEL chain — first a judge reasoning step that grounds its answer strictly in our retrieved legal chunks, then a citation validation step that programmatically checks if every section referenced actually exists. This eliminates hallucinated sections, which is critical for legal trust."*