"""
Endpoints para o Simulador de Objeções e Treinamento de Vendas
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime, timedelta

from ..database import get_db
from ..security import get_current_user_payload
from ..models import User, PageAnalysis, TrainingSession
from ..schemas import (
    GenerateObjectionsRequest,
    GenerateObjectionsResponse,
    SubmitResponseRequest,
    SubmitResponseResponse,
    TrainingSessionOut,
    TrainingStatsResponse,
    ObjectionItem,
    ResponseEvaluation
)
from ..services.objections import generate_objections, evaluate_response

router = APIRouter(prefix="/training", tags=["Training"])


@router.post("/objections/generate", response_model=GenerateObjectionsResponse)
async def generate_objections_endpoint(
    request: GenerateObjectionsRequest,
    db: Session = Depends(get_db),
    user_payload = Depends(get_current_user_payload)
):
    """
    Gera objeções de vendas baseadas em uma análise de empresa.
    
    - **analysis_id**: ID da análise da empresa
    - **difficulty**: Nível de dificuldade (easy, medium, hard)
    """
    # Busca a análise
    analysis = db.query(PageAnalysis).filter(PageAnalysis.id == request.analysis_id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Análise não encontrada"
        )
    
    # Gera objeções
    result = await generate_objections(analysis, request.difficulty)
    
    # Converte para o schema de resposta
    objections = [ObjectionItem(**obj) for obj in result["objections"]]
    
    return GenerateObjectionsResponse(
        objections=objections,
        company_context=result["company_context"],
        overall_strategy=result["overall_strategy"]
    )


@router.post("/objections/submit", response_model=SubmitResponseResponse)
async def submit_response_endpoint(
    request: SubmitResponseRequest,
    db: Session = Depends(get_db),
    user_payload = Depends(get_current_user_payload)
):
    """
    Submete uma resposta a uma objeção e recebe avaliação com feedback.
    
    - **objection**: A objeção apresentada
    - **user_response**: Resposta do usuário
    - **suggested_response**: Resposta sugerida pelo sistema
    - **company_context**: Contexto da empresa
    - **analysis_id**: (Opcional) ID da análise relacionada
    - **difficulty**: Nível de dificuldade
    """
    # Avalia a resposta
    evaluation_result = await evaluate_response(
        objection=request.objection,
        user_response=request.user_response,
        suggested_response=request.suggested_response,
        company_context=request.company_context
    )
    
    # Salva a sessão de treinamento no banco
    session = TrainingSession(
        user_id=int(user_payload["sub"]),
        analysis_id=request.analysis_id,
        difficulty=request.difficulty,
        objection=request.objection,
        objection_type=request.objection_type,
        user_response=request.user_response,
        suggested_response=request.suggested_response,
        evaluation=json.dumps(evaluation_result, ensure_ascii=False),
        score=evaluation_result.get("score", 0)
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Retorna avaliação
    return SubmitResponseResponse(
        evaluation=ResponseEvaluation(**evaluation_result),
        session_id=session.id
    )


@router.get("/history", response_model=List[TrainingSessionOut])
async def get_training_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    user_payload = Depends(get_current_user_payload)
):
    """
    Retorna histórico de sessões de treinamento do usuário.
    """
    sessions = (
        db.query(TrainingSession)
        .filter(TrainingSession.user_id == int(user_payload["sub"]))
        .order_by(TrainingSession.created_at.desc())
        .limit(limit)
        .all()
    )
    
    # Converte evaluation de JSON string para dict
    for session in sessions:
        if session.evaluation and isinstance(session.evaluation, str):
            try:
                session.evaluation = json.loads(session.evaluation)
            except:
                session.evaluation = None
    
    return sessions


@router.get("/stats", response_model=TrainingStatsResponse)
async def get_training_stats(
    db: Session = Depends(get_db),
    user_payload = Depends(get_current_user_payload)
):
    """
    Retorna estatísticas de treinamento do usuário.
    """
    # Busca todas as sessões do usuário
    all_sessions = (
        db.query(TrainingSession)
        .filter(TrainingSession.user_id == int(user_payload["sub"]))
        .order_by(TrainingSession.created_at.asc())
        .all()
    )
    
    if not all_sessions:
        return TrainingStatsResponse(
            total_sessions=0,
            average_score=0.0,
            sessions_by_difficulty={},
            sessions_by_type={},
            recent_sessions=[],
            improvement_trend=[]
        )
    
    # Calcula estatísticas
    total_sessions = len(all_sessions)
    scores = [s.score for s in all_sessions if s.score is not None]
    average_score = sum(scores) / len(scores) if scores else 0.0
    
    # Conta por dificuldade
    sessions_by_difficulty = {}
    for session in all_sessions:
        diff = session.difficulty
        sessions_by_difficulty[diff] = sessions_by_difficulty.get(diff, 0) + 1
    
    # Conta por tipo
    sessions_by_type = {}
    for session in all_sessions:
        obj_type = session.objection_type or "geral"
        sessions_by_type[obj_type] = sessions_by_type.get(obj_type, 0) + 1
    
    # Sessões recentes (últimas 10)
    recent_sessions = all_sessions[-10:][::-1]
    
    # Processa evaluation JSON
    for session in recent_sessions:
        if session.evaluation and isinstance(session.evaluation, str):
            try:
                session.evaluation = json.loads(session.evaluation)
            except:
                session.evaluation = None
    
    # Tendência de melhoria (média por semana)
    improvement_trend = []
    if all_sessions:
        # Agrupa por semana
        weekly_scores = {}
        for session in all_sessions:
            if session.score is not None:
                week = session.created_at.strftime("%Y-W%U")
                if week not in weekly_scores:
                    weekly_scores[week] = []
                weekly_scores[week].append(session.score)
        
        # Calcula média por semana
        for week in sorted(weekly_scores.keys()):
            avg_score = sum(weekly_scores[week]) / len(weekly_scores[week])
            improvement_trend.append({
                "week": week,
                "average_score": round(avg_score, 1),
                "sessions_count": len(weekly_scores[week])
            })
    
    return TrainingStatsResponse(
        total_sessions=total_sessions,
        average_score=round(average_score, 1),
        sessions_by_difficulty=sessions_by_difficulty,
        sessions_by_type=sessions_by_type,
        recent_sessions=recent_sessions,
        improvement_trend=improvement_trend
    )


@router.delete("/history", status_code=status.HTTP_200_OK)
async def clear_training_history(
    db: Session = Depends(get_db),
    user_payload = Depends(get_current_user_payload)
):
    """
    Limpa todo o histórico de treinamento do usuário.
    """
    db.query(TrainingSession).filter(TrainingSession.user_id == int(user_payload["sub"])).delete()
    db.commit()
    
    return {"message": "Histórico de treinamento limpo com sucesso"}


@router.delete("/history/{session_id}", status_code=status.HTTP_200_OK)
async def delete_training_session(
    session_id: int,
    db: Session = Depends(get_db),
    user_payload = Depends(get_current_user_payload)
):
    """
    Deleta uma sessão de treinamento específica.
    """
    session = (
        db.query(TrainingSession)
        .filter(
            TrainingSession.id == session_id,
            TrainingSession.user_id == int(user_payload["sub"])
        )
        .first()
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão de treinamento não encontrada"
        )
    
    db.delete(session)
    db.commit()
    
    return {"message": "Sessão de treinamento deletada com sucesso"}

