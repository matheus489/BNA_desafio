"""
Router para Kanban Board do Pipeline de Vendas
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from pydantic import BaseModel
import json

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload

router = APIRouter(prefix="/kanban", tags=["Kanban"])

# Estágios válidos do pipeline
VALID_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed']


class UpdateStageRequest(BaseModel):
    stage: str


@router.get("/pipeline")
async def get_pipeline(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Retorna todo o pipeline organizado por estágios
    
    Formato:
    {
      "lead": [análise1, análise2, ...],
      "qualified": [...],
      ...
    }
    """
    user_id = int(user.get("sub"))
    
    # Busca todas as análises do usuário
    analyses = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.owner_id == user_id
    ).order_by(models.PageAnalysis.created_at.desc()).all()
    
    # Organiza por estágio
    pipeline = {stage: [] for stage in VALID_STAGES}
    
    for analysis in analyses:
        stage = analysis.stage or 'lead'
        
        # Parse entities para incluir na resposta
        entities = {}
        try:
            if analysis.entities:
                entities = json.loads(analysis.entities)
        except:
            pass
        
        # Monta card
        card = {
            "id": analysis.id,
            "title": analysis.title or "Sem título",
            "url": analysis.url,
            "stage": stage,
            "created_at": analysis.created_at.isoformat(),
            "summary": analysis.summary[:200] if analysis.summary else None,
            "sales_potential": entities.get('sales_potential', 'Médio'),
            "industry": entities.get('industry', 'N/A'),
            "has_enrichment": bool(entities.get('enriched_data'))
        }
        
        if stage in pipeline:
            pipeline[stage].append(card)
        else:
            pipeline['lead'].append(card)
    
    # Calcula estatísticas
    stats = {
        "total": len(analyses),
        "by_stage": {stage: len(cards) for stage, cards in pipeline.items()}
    }
    
    return {
        "pipeline": pipeline,
        "stats": stats
    }


@router.patch("/analysis/{analysis_id}/stage")
async def update_analysis_stage(
    analysis_id: int,
    request: UpdateStageRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Atualiza o estágio de uma análise (drag and drop)
    """
    user_id = int(user.get("sub"))
    
    # Valida estágio
    if request.stage not in VALID_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Estágio inválido. Use um de: {', '.join(VALID_STAGES)}"
        )
    
    # Busca análise (permite owner ou seller)
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).filter(
        (models.PageAnalysis.owner_id == user_id) | 
        (models.PageAnalysis.seller_id == user_id)
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    old_stage = analysis.stage
    analysis.stage = request.stage
    
    db.commit()
    db.refresh(analysis)
    
    # Gera sugestão de IA baseada no novo estágio
    suggestion = await _generate_stage_suggestion(analysis, request.stage, db)
    
    return {
        "status": "success",
        "analysis_id": analysis_id,
        "old_stage": old_stage,
        "new_stage": request.stage,
        "suggestion": suggestion
    }


@router.get("/analysis/{analysis_id}/suggestions")
async def get_analysis_suggestions(
    analysis_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Retorna sugestões de próximas ações para uma análise
    """
    user_id = int(user.get("sub"))
    
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id,
        models.PageAnalysis.owner_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    suggestions = await _generate_stage_suggestion(analysis, analysis.stage, db)
    
    return {"suggestions": suggestions}


async def _generate_stage_suggestion(analysis, stage: str, db: Session) -> List[str]:
    """
    Gera sugestões de próximas ações baseado no estágio atual
    """
    
    # Sugestões padrão por estágio
    stage_suggestions = {
        'lead': [
            "🔍 Enriquecer com dados de múltiplas fontes",
            "📧 Preparar email de prospecção inicial",
            "🎯 Verificar fit com ICP"
        ],
        'qualified': [
            "📞 Agendar call de discovery",
            "📊 Preparar análise de ROI personalizada",
            "🤝 Identificar stakeholders chave"
        ],
        'proposal': [
            "📄 Enviar proposta comercial",
            "💰 Preparar pricing customizado",
            "📈 Destacar cases de sucesso similares"
        ],
        'negotiation': [
            "⚖️ Revisar objeções e preparar contra-argumentos",
            "🤝 Agendar reunião com tomador de decisão",
            "📋 Preparar contrato"
        ],
        'closed': [
            "🎉 Parabenizar equipe",
            "📝 Documentar lições aprendidas",
            "🔄 Identificar oportunidades de upsell"
        ]
    }
    
    base_suggestions = stage_suggestions.get(stage, [])
    
    # Adiciona sugestões personalizadas baseadas na análise
    try:
        entities = json.loads(analysis.entities) if analysis.entities else {}
        
        # Se não tem enrichment, sugere
        if not entities.get('enriched_data') and stage == 'lead':
            base_suggestions.insert(0, "🌐 Enriquecer dados (LinkedIn, Crunchbase, GitHub)")
        
        # Se tem alto potencial, prioriza
        if entities.get('sales_potential') == 'Alto':
            base_suggestions.insert(0, "🔥 PRIORIDADE: Alta probabilidade de fechamento")
            
    except:
        pass
    
    return base_suggestions[:4]  # Top 4 sugestões


@router.post("/bulk-update-stage")
async def bulk_update_stage(
    analysis_ids: List[int],
    new_stage: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Atualiza estágio de múltiplas análises de uma vez
    """
    user_id = int(user.get("sub"))
    
    if new_stage not in VALID_STAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Estágio inválido. Use um de: {', '.join(VALID_STAGES)}"
        )
    
    if len(analysis_ids) > 50:
        raise HTTPException(status_code=400, detail="Máximo de 50 análises por vez")
    
    # Atualiza todas
    updated_count = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id.in_(analysis_ids),
        models.PageAnalysis.owner_id == user_id
    ).update({"stage": new_stage}, synchronize_session=False)
    
    db.commit()
    
    return {
        "status": "success",
        "updated_count": updated_count,
        "new_stage": new_stage
    }


@router.get("/stats")
async def get_pipeline_stats(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Estatísticas detalhadas do pipeline
    """
    user_id = int(user.get("sub"))
    
    analyses = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.owner_id == user_id
    ).all()
    
    # Conta por estágio
    by_stage = {stage: 0 for stage in VALID_STAGES}
    for analysis in analyses:
        stage = analysis.stage or 'lead'
        if stage in by_stage:
            by_stage[stage] += 1
    
    # Taxa de conversão (simplificada)
    conversion_rates = {}
    stages_list = list(VALID_STAGES)
    for i in range(len(stages_list) - 1):
        current_stage = stages_list[i]
        next_stage = stages_list[i + 1]
        
        current_count = by_stage[current_stage]
        next_count = by_stage[next_stage]
        
        if current_count > 0:
            rate = (next_count / current_count) * 100
            conversion_rates[f"{current_stage}_to_{next_stage}"] = round(rate, 1)
    
    # Tempo médio por estágio (mock - requer histórico)
    avg_time_by_stage = {
        'lead': "2-3 dias",
        'qualified': "5-7 dias",
        'proposal': "7-10 dias",
        'negotiation': "10-15 dias",
        'closed': "N/A"
    }
    
    return {
        "total_analyses": len(analyses),
        "by_stage": by_stage,
        "conversion_rates": conversion_rates,
        "avg_time_by_stage": avg_time_by_stage
    }


# ========== ROTAS PARA NOTAS E ANEXOS ==========

class CreateNoteRequest(BaseModel):
    content: str


class CreateAttachmentRequest(BaseModel):
    filename: str
    file_url: str
    file_type: str = None
    file_size: int = None


@router.get("/analysis/{analysis_id}/details")
async def get_analysis_details(
    analysis_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Retorna detalhes completos de uma análise incluindo notas e anexos
    """
    user_id = int(user.get("sub"))
    
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Parse entities e key_points
    entities = {}
    key_points = []
    try:
        if analysis.entities:
            entities = json.loads(analysis.entities)
        if analysis.key_points:
            key_points = json.loads(analysis.key_points)
    except:
        pass
    
    # Busca notas
    notes = db.query(models.AnalysisNote).filter(
        models.AnalysisNote.analysis_id == analysis_id
    ).order_by(models.AnalysisNote.created_at.desc()).all()
    
    # Busca anexos
    attachments = db.query(models.AnalysisAttachment).filter(
        models.AnalysisAttachment.analysis_id == analysis_id
    ).order_by(models.AnalysisAttachment.created_at.desc()).all()
    
    return {
        "id": analysis.id,
        "title": analysis.title,
        "url": analysis.url,
        "summary": analysis.summary,
        "raw_text": analysis.raw_text,
        "key_points": key_points,
        "entities": entities,
        "stage": analysis.stage,
        "seller_id": analysis.seller_id,
        "created_at": analysis.created_at.isoformat(),
        "notes": [
            {
                "id": note.id,
                "content": note.content,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
                "user_email": note.user.email if note.user else "Unknown"
            }
            for note in notes
        ],
        "attachments": [
            {
                "id": att.id,
                "filename": att.filename,
                "file_url": att.file_url,
                "file_type": att.file_type,
                "file_size": att.file_size,
                "created_at": att.created_at.isoformat(),
                "user_email": att.user.email if att.user else "Unknown"
            }
            for att in attachments
        ]
    }


@router.post("/analysis/{analysis_id}/notes")
async def create_note(
    analysis_id: int,
    request: CreateNoteRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Cria uma nova nota para uma análise
    """
    user_id = int(user.get("sub"))
    
    # Verifica se a análise existe e pertence ao usuário (owner ou seller)
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).filter(
        (models.PageAnalysis.owner_id == user_id) | 
        (models.PageAnalysis.seller_id == user_id)
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Cria nota
    note = models.AnalysisNote(
        analysis_id=analysis_id,
        user_id=user_id,
        content=request.content
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }


@router.put("/analysis/{analysis_id}/notes/{note_id}")
async def update_note(
    analysis_id: int,
    note_id: int,
    request: CreateNoteRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Atualiza uma nota existente
    """
    user_id = int(user.get("sub"))
    
    note = db.query(models.AnalysisNote).filter(
        models.AnalysisNote.id == note_id,
        models.AnalysisNote.analysis_id == analysis_id,
        models.AnalysisNote.user_id == user_id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    
    note.content = request.content
    note.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(note)
    
    return {
        "id": note.id,
        "content": note.content,
        "created_at": note.created_at.isoformat(),
        "updated_at": note.updated_at.isoformat()
    }


@router.delete("/analysis/{analysis_id}/notes/{note_id}")
async def delete_note(
    analysis_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Deleta uma nota
    """
    user_id = int(user.get("sub"))
    
    note = db.query(models.AnalysisNote).filter(
        models.AnalysisNote.id == note_id,
        models.AnalysisNote.analysis_id == analysis_id,
        models.AnalysisNote.user_id == user_id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Nota não encontrada")
    
    db.delete(note)
    db.commit()
    
    return {"status": "success", "message": "Nota deletada"}


@router.post("/analysis/{analysis_id}/attachments")
async def create_attachment(
    analysis_id: int,
    request: CreateAttachmentRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Adiciona um anexo a uma análise
    """
    user_id = int(user.get("sub"))
    
    # Verifica se a análise existe e pertence ao usuário (owner ou seller)
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).filter(
        (models.PageAnalysis.owner_id == user_id) | 
        (models.PageAnalysis.seller_id == user_id)
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Cria anexo
    attachment = models.AnalysisAttachment(
        analysis_id=analysis_id,
        user_id=user_id,
        filename=request.filename,
        file_url=request.file_url,
        file_type=request.file_type,
        file_size=request.file_size
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return {
        "id": attachment.id,
        "filename": attachment.filename,
        "file_url": attachment.file_url,
        "file_type": attachment.file_type,
        "file_size": attachment.file_size,
        "created_at": attachment.created_at.isoformat()
    }


@router.delete("/analysis/{analysis_id}/attachments/{attachment_id}")
async def delete_attachment(
    analysis_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Deleta um anexo
    """
    user_id = int(user.get("sub"))
    
    attachment = db.query(models.AnalysisAttachment).filter(
        models.AnalysisAttachment.id == attachment_id,
        models.AnalysisAttachment.analysis_id == analysis_id,
        models.AnalysisAttachment.user_id == user_id
    ).first()
    
    if not attachment:
        raise HTTPException(status_code=404, detail="Anexo não encontrado")
    
    db.delete(attachment)
    db.commit()
    
    return {"status": "success", "message": "Anexo deletado"}


# ========== ROTAS PARA VENDEDORES ==========

class AssignSellerRequest(BaseModel):
    seller_id: int


@router.get("/sellers")
async def get_sellers(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Lista todos os vendedores disponíveis
    """
    user_id = int(user.get("sub"))
    user_role = user.get("role", "user")
    
    # Todos os usuários podem ver vendedores, mas apenas admins podem atribuir
    
    sellers = db.query(models.User).filter(
        models.User.role.in_(["user", "seller"])
    ).all()
    
    return [
        {
            "id": seller.id,
            "email": seller.email,
            "role": seller.role,
            "created_at": seller.created_at.isoformat()
        }
        for seller in sellers
    ]


@router.patch("/analysis/{analysis_id}/assign-seller")
async def assign_seller(
    analysis_id: int,
    request: AssignSellerRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Atribui um vendedor a uma análise
    """
    user_id = int(user.get("sub"))
    user_role = user.get("role", "user")
    
    # Verifica se a análise existe (temporariamente removida restrição de owner)
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Verifica se o vendedor existe
    seller = db.query(models.User).filter(
        models.User.id == request.seller_id
    ).first()
    
    if not seller:
        raise HTTPException(status_code=404, detail="Vendedor não encontrado")
    
    # Atualiza o vendedor
    analysis.seller_id = request.seller_id
    db.commit()
    db.refresh(analysis)
    
    return {
        "status": "success",
        "analysis_id": analysis_id,
        "seller_id": request.seller_id,
        "seller_email": seller.email
    }


@router.patch("/analysis/{analysis_id}/unassign-seller")
async def unassign_seller(
    analysis_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Remove a atribuição de vendedor de uma análise
    """
    user_id = int(user.get("sub"))
    
    # Verifica se a análise existe e se o usuário tem acesso
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id,
        models.PageAnalysis.owner_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Remove o vendedor
    analysis.seller_id = None
    db.commit()
    db.refresh(analysis)
    
    return {
        "status": "success",
        "analysis_id": analysis_id,
        "message": "Vendedor removido com sucesso"
    }


@router.get("/my-pipeline")
async def get_my_pipeline(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Retorna o pipeline do vendedor (apenas cards atribuídos a ele)
    """
    user_id = int(user.get("sub"))
    
    # Busca análises atribuídas ao vendedor
    analyses = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.seller_id == user_id
    ).order_by(models.PageAnalysis.created_at.desc()).all()
    
    # Organiza por estágio
    pipeline = {stage: [] for stage in VALID_STAGES}
    
    for analysis in analyses:
        stage = analysis.stage or 'lead'
        
        # Parse entities para incluir na resposta
        entities = {}
        try:
            if analysis.entities:
                entities = json.loads(analysis.entities)
        except:
            pass
        
        # Monta card
        card = {
            "id": analysis.id,
            "title": analysis.title or "Sem título",
            "url": analysis.url,
            "stage": stage,
            "created_at": analysis.created_at.isoformat(),
            "summary": analysis.summary[:200] if analysis.summary else None,
            "sales_potential": entities.get('sales_potential', 'Médio'),
            "industry": entities.get('industry', 'N/A'),
            "has_enrichment": bool(entities.get('enriched_data')),
            "owner_email": analysis.owner.email if analysis.owner else "N/A"
        }
        
        if stage in pipeline:
            pipeline[stage].append(card)
        else:
            pipeline['lead'].append(card)
    
    # Calcula estatísticas
    stats = {
        "total": len(analyses),
        "by_stage": {stage: len(cards) for stage, cards in pipeline.items()}
    }
    
    return {
        "pipeline": pipeline,
        "stats": stats
    }