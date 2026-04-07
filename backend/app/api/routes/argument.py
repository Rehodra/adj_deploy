"""
Argument Submission API Routes for AI Legal Courtroom Simulator
Handles argument evaluation, opponent responses, and scoring
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, List
from datetime import datetime
import asyncio

from app.models.schemas import (
    ArgumentRequest,
    EvaluationResponse,
    ErrorResponse,
    SuccessResponse,
    GameMode,
    CourtPhase,
    PerformanceTier,
    Position
)


from app.ai_system.agents.judge_agent import JudgeAgent
from app.ai_system.agents.opponent_agent import OpponentAgent
from app.ai_system.rag.retriever import RAGRetriever
from app.services.scoring_service import ScoringService
from app.services.translation_service import get_translation_service
from app.config import get_settings
from app.api.routes.session import get_valid_session


router = APIRouter(tags=["argument"])

# Initialize AI agents (singleton pattern)
_settings = get_settings()
_rag_retriever = None
_judge_agent = None
_opponent_agent = None
_lcel_pipeline = None         # ← Only used for final verdict (2-call path)
_orchestrator = None          # ← Fast path for RAG context retrieval


def get_orchestrator():
    """Get or initialize the LegalRetrieverOrchestrator (fast path)."""
    global _orchestrator
    if _orchestrator is None:
        from app.ai_system.rag.orchestrator import LegalRetrieverOrchestrator
        _orchestrator = LegalRetrieverOrchestrator()
    return _orchestrator


def get_lcel_pipeline():
    """
    Lazy-load the LCEL pipeline — only instantiated on first verdict request.
    Uses 2 Gemini API calls (generate + validate), so we keep it for verdicts only.
    """
    global _lcel_pipeline
    if _lcel_pipeline is None:
        from app.ai_system.rag.lcel_pipeline import LegalLCELPipeline
        _lcel_pipeline = LegalLCELPipeline(api_key=_settings.GEMINI_API_KEY)
    return _lcel_pipeline


def get_rag_retriever() -> RAGRetriever:
    """Get or initialize RAG retriever"""
    global _rag_retriever
    if _rag_retriever is None:
        _rag_retriever = RAGRetriever(
            api_key=_settings.GEMINI_API_KEY,
            vector_db_path=_settings.VECTOR_DB_PATH
        )
    return _rag_retriever


def get_judge_agent() -> JudgeAgent:
    """Get or initialize judge agent"""
    global _judge_agent
    if _judge_agent is None:
        provider = getattr(_settings, "AI_PROVIDER", "gemini").lower()
        if provider == "groq":
            api_key = getattr(_settings, "JUDGE_API_KEY", "") or getattr(_settings, "GROQ_API_KEY", "")
            model_name = getattr(_settings, "JUDGE_MODEL", "llama-3.3-70b-versatile")
        else:
            api_key = _settings.GEMINI_API_KEY
            model_name = _settings.GEMINI_MODEL
            
        _judge_agent = JudgeAgent(
            api_key=api_key,
            rag_retriever=get_rag_retriever(),
            model_name=model_name,
            provider=provider
        )
    return _judge_agent


def get_opponent_agent() -> OpponentAgent:
    """Get or initialize opponent agent"""
    global _opponent_agent
    if _opponent_agent is None:
        provider = getattr(_settings, "AI_PROVIDER", "gemini").lower()
        if provider == "groq":
            api_key = getattr(_settings, "OPPONENT_API_KEY", "") or getattr(_settings, "GROQ_API_KEY", "")
            model_name = getattr(_settings, "OPPONENT_MODEL", "llama-3.1-8b-instant")
        else:
            api_key = _settings.GEMINI_API_KEY
            model_name = _settings.GEMINI_MODEL
            
        _opponent_agent = OpponentAgent(
            api_key=api_key,
            rag_retriever=get_rag_retriever(),
            model_name=model_name,
            provider=provider
        )
    return _opponent_agent


@router.post("/submit", response_model=EvaluationResponse)
async def submit_argument(
    request: ArgumentRequest,
    background_tasks: BackgroundTasks
):
    """
    Submit argument and get evaluation + opponent response
    
    Args:
        request: Argument submission request with optional language parameter
        
    Returns:
        EvaluationResponse with scores, feedback, and opponent response
    """
    try:
        # Validate session from the request body
        session_data = await get_valid_session(request.session_id)
        
        # Get translation service
        translation_service = get_translation_service()
        language = request.language or "English"
        
        # If language is not English, translate argument to English for processing
        argument_to_process = request.argument_text
        if language != "English":
            print(f"Translating argument from {language} to English")
            argument_to_process = await translation_service.translate_to_english(
                request.argument_text,
                language
            )
        
        # Get AI agents
        judge = get_judge_agent()
        opponent = get_opponent_agent()
        
        # Determine opponent position based on case type and session phase
        opponent_position = determine_opponent_position(session_data, request.phase)
        
        # 1. Judge evaluates the argument (always in English internally)
        evaluation = judge.evaluate_argument(
            user_argument=argument_to_process,
            cited_sections=request.cited_sections,
            case_facts=session_data["case_facts"],
            phase=request.phase.value if request.phase else session_data["current_phase"].value
        )
        
        # 2. Calculate turn score
        turn_score = ScoringService.calculate_score(evaluation)
        
        # 3. Opponent generates counter-argument
        opponent_response = opponent.generate_counter_argument(
            user_argument=argument_to_process,
            case_facts=session_data["case_facts"],
            position=opponent_position,
            phase=request.phase.value if request.phase else session_data["current_phase"].value
        )
        
        # 4. Translate responses back to user's language if needed
        judge_feedback = evaluation["feedback"]
        opponent_response_text = opponent_response
        suggestions = evaluation["suggestions"]
        incorrect_sections = evaluation["incorrect_sections"]
        
        if language != "English":
            print(f"Translating entire judge feedback and response to {language}")
            
            # Translate judge feedback
            judge_feedback = await translation_service.translate_from_english(
                evaluation["feedback"],
                language
            )
            
            # Translate opponent response
            opponent_response_text = await translation_service.translate_from_english(
                opponent_response,
                language
            )
            
            # Translate suggestions list
            if evaluation["suggestions"]:
                translated_suggestions = []
                for sug in evaluation["suggestions"]:
                    translated_sug = await translation_service.translate_from_english(sug, language)
                    translated_suggestions.append(translated_sug)
                suggestions = translated_suggestions
                
            # Translate incorrect sections reasons
            if evaluation["incorrect_sections"]:
                translated_incorrect = []
                for inc in evaluation["incorrect_sections"]:
                    # The incorrect_sections reason should be translated
                    reason_to_translate = inc.get("reason", "")
                    if reason_to_translate:
                        translated_reason = await translation_service.translate_from_english(reason_to_translate, language)
                        translated_incorrect.append({
                            "section": inc.get("section", ""),
                            "reason": translated_reason
                        })
                    else:
                        translated_incorrect.append(inc)
                incorrect_sections = translated_incorrect

        # Trigger TTS caching in the background for the opponent's translated string
        from app.api.routes.audio import text_to_speech
        background_tasks.add_task(text_to_speech, text=opponent_response_text, language=language, role="opponent")
        
        # 5. Update session data
        argument_record = {
            "argument_id": str(len(session_data["arguments"]) + 1),
            "argument_text": request.argument_text,
            "argument_text_english": argument_to_process,
            "cited_sections": request.cited_sections,
            "evidence_references": request.evidence_references,
            "evaluation": evaluation,
            "judge_feedback_translated": judge_feedback,
            "opponent_response": opponent_response,
            "opponent_response_translated": opponent_response_text,
            "suggestions_translated": suggestions,
            "incorrect_sections_translated": incorrect_sections,
            "language": language,
            "turn_score": turn_score,
            "phase": request.phase.value if request.phase else session_data["current_phase"].value,
            "timestamp": datetime.utcnow()
        }
        
        session_data["arguments"].append(argument_record)
        session_data["total_score"] += turn_score
        session_data["last_activity"] = datetime.utcnow()
        session_data["language"] = language  # Store language in session
        
        # 6. Calculate performance metrics
        num_arguments = len(session_data["arguments"])
        avg_score = session_data["total_score"] / num_arguments
        performance_tier = ScoringService.get_performance_tier(avg_score)
        
        # 7. Build response (feedback and opponent_response in user's language)
        return EvaluationResponse(
            legal_accuracy_score=evaluation["legal_accuracy_score"],
            reasoning_score=evaluation["reasoning_score"],
            evidence_score=evaluation["evidence_score"],
            overall_score=evaluation["overall_score"],
            feedback=judge_feedback,
            correct_sections=evaluation["correct_sections"],
            incorrect_sections=incorrect_sections,
            suggestions=suggestions,
            turn_score=turn_score,
            cumulative_score=session_data["total_score"],
            performance_tier=performance_tier,
            opponent_response=opponent_response_text
        )
        
    except Exception as e:
        # Log error for debugging
        print(f"Error in submit_argument: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing argument: {str(e)}"
        )


@router.get("/{session_id}/history")
async def get_argument_history(
    session_id: str,
    session_data: Dict = Depends(get_valid_session)
):
    """
    Get argument history for a session
    
    Args:
        session_id: Session identifier
        session_data: Valid session data (injected by dependency)
        
    Returns:
        List of argument history records
    """
    try:
        arguments = session_data["arguments"]
        
        # Format arguments for response
        formatted_arguments = []
        for arg in arguments:
            # Use translated versions if available, otherwise original
            opponent_resp = arg.get("opponent_response_translated", arg.get("opponent_response", ""))
            
            formatted_arg = {
                "argument_id": arg["argument_id"],
                "argument_text": arg["argument_text"],
                "cited_sections": arg["cited_sections"],
                "evidence_references": arg.get("evidence_references", []),
                "phase": arg["phase"],
                "turn_score": arg["turn_score"],
                "evaluation_summary": {
                    "legal_accuracy": arg["evaluation"]["legal_accuracy_score"],
                    "reasoning": arg["evaluation"]["reasoning_score"],
                    "evidence": arg["evaluation"]["evidence_score"],
                    "overall": arg["evaluation"]["overall_score"],
                    "feedback": arg.get("judge_feedback_translated", arg["evaluation"].get("feedback", ""))
                },
                "opponent_response_preview": opponent_resp[:200] + "..." if len(opponent_resp) > 200 else opponent_resp,
                "timestamp": arg["timestamp"]
            }
            formatted_arguments.append(formatted_arg)
        
        return {
            "session_id": session_id,
            "total_arguments": len(arguments),
            "arguments": formatted_arguments
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving argument history: {str(e)}"
        )


@router.get("/{session_id}/analytics")
async def get_session_analytics(
    session_id: str,
    session_data: Dict = Depends(get_valid_session)
):
    """
    Get detailed performance analytics for a session
    
    Args:
        session_id: Session identifier
        session_data: Valid session data (injected by dependency)
        
    Returns:
        Detailed performance analytics
    """
    try:
        arguments = session_data["arguments"]
        
        if not arguments:
            return {
                "session_id": session_id,
                "message": "No arguments submitted yet",
                "analytics": None
            }
        
        # Extract evaluations for analysis
        evaluations = [arg["evaluation"] for arg in arguments]
        
        # Calculate performance metrics
        performance = ScoringService.analyze_performance(evaluations)
        
        # Calculate component averages
        legal_accuracy_avg = sum(eval_["legal_accuracy_score"] for eval_ in evaluations) / len(evaluations)
        reasoning_avg = sum(eval_["reasoning_score"] for eval_ in evaluations) / len(evaluations)
        evidence_avg = sum(eval_["evidence_score"] for eval_ in evaluations) / len(evaluations)
        
        # Analyze cited sections
        all_correct_sections = []
        all_incorrect_sections = []
        
        for arg in arguments:
            all_correct_sections.extend(arg["evaluation"]["correct_sections"])
            all_incorrect_sections.extend(arg["evaluation"]["incorrect_sections"])
        
        # Count most cited sections
        section_counts = {}
        for arg in arguments:
            for section in arg["cited_sections"]:
                section_counts[section] = section_counts.get(section, 0) + 1
        
        most_cited_sections = sorted(section_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Generate improvement suggestions
        suggestions = ScoringService.get_improvement_suggestions(evaluations)
        
        return {
            "session_id": session_id,
            "session_duration": (datetime.utcnow() - session_data["created_at"]).total_seconds() / 60,  # minutes
            "total_arguments": len(arguments),
            "average_score": performance.average_score,
            "best_score": performance.best_score,
            "worst_score": performance.worst_score,
            "improvement_trend": performance.improvement_trend,
            "consistency_score": performance.consistency_score,
            "performance_tier": performance.performance_tier.value,
            "score_breakdown": {
                "legal_accuracy": round(legal_accuracy_avg, 2),
                "reasoning": round(reasoning_avg, 2),
                "evidence": round(evidence_avg, 2)
            },
            "correct_sections_count": len(all_correct_sections),
            "incorrect_sections_count": len(all_incorrect_sections),
            "most_cited_sections": [{"section": sec, "count": count} for sec, count in most_cited_sections],
            "improvement_suggestions": suggestions,
            "phase_distribution": calculate_phase_distribution(arguments)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating analytics: {str(e)}"
        )


@router.post("/{session_id}/feedback")
async def submit_feedback(
    session_id: str,
    feedback_data: Dict,
    session_data: Dict = Depends(get_valid_session)
):
    """
    Submit user feedback on AI responses
    
    Args:
        session_id: Session identifier
        feedback_data: Feedback data
        session_data: Valid session data (injected by dependency)
        
    Returns:
        Success response
    """
    try:
        # Validate feedback data
        required_fields = ["argument_id", "rating", "comment"]
        for field in required_fields:
            if field not in feedback_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required field: {field}"
                )
        
        argument_id = feedback_data["argument_id"]
        rating = feedback_data["rating"]
        comment = feedback_data["comment"]
        
        # Validate rating range
        if not (1 <= rating <= 5):
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )
        
        # Find the argument
        target_argument = None
        for arg in session_data["arguments"]:
            if arg["argument_id"] == argument_id:
                target_argument = arg
                break
        
        if not target_argument:
            raise HTTPException(
                status_code=404,
                detail="Argument not found"
            )
        
        # Store feedback (in production, save to database)
        feedback_record = {
            "argument_id": argument_id,
            "rating": rating,
            "comment": comment,
            "timestamp": datetime.utcnow()
        }
        
        # Add feedback to argument record
        if "feedback" not in target_argument:
            target_argument["feedback"] = []
        target_argument["feedback"].append(feedback_record)
        
        return SuccessResponse(
            message="Feedback submitted successfully",
            data={"argument_id": argument_id, "rating": rating}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error submitting feedback: {str(e)}"
        )


@router.get("/{session_id}/export")
async def export_session_data(
    session_id: str,
    session_data: Dict = Depends(get_valid_session)
):
    """
    Export session data for download or analysis
    
    Args:
        session_id: Session identifier
        session_data: Valid session data (injected by dependency)
        
    Returns:
        Exported session data
    """
    try:
        # Prepare export data
        export_data = {
            "session_info": {
                "session_id": session_id,
                "case_id": session_data["case_id"],
                "user_id": session_data["user_id"],
                "mode": session_data["mode"],
                "created_at": session_data["created_at"],
                "last_activity": session_data["last_activity"],
                "total_arguments": len(session_data["arguments"]),
                "final_score": session_data["total_score"]
            },
            "case_facts": session_data["case_facts"],
            "arguments": []
        }
        
        # Include detailed argument data
        for arg in session_data["arguments"]:
            arg_export = {
                "argument_id": arg["argument_id"],
                "argument_text": arg["argument_text"],
                "cited_sections": arg["cited_sections"],
                "evidence_references": arg.get("evidence_references", []),
                "phase": arg["phase"],
                "timestamp": arg["timestamp"],
                "evaluation": arg["evaluation"],
                "opponent_response": arg["opponent_response"],
                "turn_score": arg["turn_score"]
            }
            
            # Include feedback if available
            if "feedback" in arg:
                arg_export["feedback"] = arg["feedback"]
            
            export_data["arguments"].append(arg_export)
        
        return export_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting session data: {str(e)}"
        )


@router.post("/{session_id}/verdict")
async def get_final_verdict(
    session_id: str,
    session_data: Dict = Depends(get_valid_session)
):
    """
    Generate a final, citation-validated verdict for the session.

    This is the ONLY endpoint that uses the 2-stage LCEL pipeline:
      - Call 1: Judge reasoning grounded in retrieved legal chunks
      - Call 2: Citation validation to catch any hallucinated sections

    This endpoint should only be called once per case at the JUDGMENT phase.
    All regular argument submissions use the fast single-call path.
    """
    try:
        import asyncio
        import time

        case_facts = session_data.get("case_facts", {})
        arguments = session_data.get("arguments", [])

        if not arguments:
            raise HTTPException(
                status_code=400,
                detail="No arguments submitted yet. Cannot generate verdict."
            )

        # Build a concise verdict query from the case facts + argument history
        case_title = case_facts.get("title", "Unknown Case")
        charges = ", ".join(case_facts.get("charges", []))
        last_arguments = [a["argument_text_english"] for a in arguments[-3:]]  # last 3 for context
        argument_summary = " | ".join(last_arguments)

        verdict_query = (
            f"Case: {case_title}. Charges: {charges}. "
            f"Based on these arguments: {argument_summary[:500]}. "
            f"Deliver the final verdict with exact IPC/CrPC section citations."
        )

        print(f"[Verdict] Invoking 2-stage LCEL pipeline for session {session_id}")
        start = time.time()

        # Run the LCEL pipeline in a thread pool to avoid blocking the event loop
        # (LangChain's .invoke() is synchronous)
        pipeline = get_lcel_pipeline()
        validated_verdict = await asyncio.get_event_loop().run_in_executor(
            None,
            pipeline.invoke,
            verdict_query
        )

        latency = time.time() - start
        print(f"[Verdict] LCEL pipeline completed in {latency:.2f}s")

        # Also get the orchestrator's citation list for the response
        orchestrator = get_orchestrator()
        rag_result = orchestrator.retrieve_final_context(verdict_query)

        # Update session to mark judgment delivered
        from app.db import db
        await db.db.sessions.update_one(
            {"session_id": session_id},
            {"$set": {
                "judgment": validated_verdict,
                "judgment_citations": rag_result["citations"],
                "judgment_timestamp": __import__("datetime").datetime.utcnow()
            }}
        )

        return {
            "session_id": session_id,
            "verdict": validated_verdict,
            "citations": rag_result["citations"],
            "detected_act": rag_result["detected_act"],
            "pipeline": "2-stage LCEL (generate + citation-validate)",
            "latency_seconds": round(latency, 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error generating verdict: {str(e)}"
        )


# Helper functions
def determine_opponent_position(session_data: Dict, phase: CourtPhase) -> str:
    """
    Determine opponent position based on case type and phase
    
    Args:
        session_data: Session data
        phase: Current phase
        
    Returns:
        Opponent position ("prosecution" or "defense")
    """
    case_type = session_data["case_facts"].get("type", "").lower()
    
    # For criminal cases, user is typically defense, opponent is prosecution
    if case_type == "criminal":
        return "prosecution"
    # For civil cases, depends on who is plaintiff
    elif case_type == "civil":
        return "defense"  # Assuming user is plaintiff
    # For constitutional cases, alternate or base on context
    else:
        return "prosecution"  # Default


def calculate_phase_distribution(arguments: List[Dict]) -> Dict:
    """
    Calculate distribution of arguments across phases
    
    Args:
        arguments: List of argument records
        
    Returns:
        Phase distribution dictionary
    """
    phase_counts = {}
    
    for arg in arguments:
        phase = arg["phase"]
        phase_counts[phase] = phase_counts.get(phase, 0) + 1
    
    total = len(arguments)
    phase_distribution = {}
    
    for phase, count in phase_counts.items():
        phase_distribution[phase] = {
            "count": count,
            "percentage": round((count / total) * 100, 2) if total > 0 else 0
        }
    
    return phase_distribution
