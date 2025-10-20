"""
Router para Enriquecimento Multi-Fonte
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
import json

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload
from ..services.multi_source_enrichment import enrichment_service

router = APIRouter(prefix="/enrichment", tags=["Enrichment"])


@router.post("/analyze/{analysis_id}")
async def enrich_analysis(
    analysis_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Enriquece uma análise existente com dados de múltiplas fontes
    
    Fontes:
    - Crunchbase (funding)
    - GitHub (tech stack real)
    - LinkedIn (company data)
    - News API (notícias recentes)
    - G2/Capterra (reviews)
    """
    # Busca análise
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Extrai dados necessários
    company_name = analysis.title or "Unknown Company"
    
    # Extrai domínio da URL
    from urllib.parse import urlparse
    parsed_url = urlparse(analysis.url)
    domain = parsed_url.netloc.replace('www.', '')
    
    # Enriquece (processo demorado, mas retorna imediatamente)
    enriched_data = await enrichment_service.enrich_company(domain, company_name)
    
    # Atualiza análise com dados enriquecidos
    current_entities = json.loads(analysis.entities) if analysis.entities else {}
    current_entities['enriched_data'] = enriched_data
    
    analysis.entities = json.dumps(current_entities, ensure_ascii=False)
    db.commit()
    db.refresh(analysis)
    
    return {
        "status": "success",
        "analysis_id": analysis_id,
        "sources_enriched": enriched_data.get('sources_count', 0),
        "enriched_data": enriched_data
    }


@router.get("/status/{analysis_id}")
async def get_enrichment_status(
    analysis_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Verifica se uma análise já foi enriquecida e retorna os dados
    """
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Verifica se tem dados enriquecidos
    entities = json.loads(analysis.entities) if analysis.entities else {}
    enriched_data = entities.get('enriched_data')
    
    if enriched_data:
        return {
            "status": "enriched",
            "sources_count": enriched_data.get('sources_count', 0),
            "enriched_data": enriched_data
        }
    else:
        return {
            "status": "not_enriched",
            "message": "Esta análise ainda não foi enriquecida com múltiplas fontes"
        }


@router.post("/bulk")
async def bulk_enrich(
    analysis_ids: list[int],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Enriquece múltiplas análises em lote (background)
    """
    if len(analysis_ids) > 10:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 10 análises por vez"
        )
    
    # Adiciona tasks em background
    for analysis_id in analysis_ids:
        background_tasks.add_task(_enrich_analysis_background, analysis_id, db)
    
    return {
        "status": "queued",
        "analyses_count": len(analysis_ids),
        "message": f"{len(analysis_ids)} análises serão enriquecidas em background"
    }


async def _enrich_analysis_background(analysis_id: int, db: Session):
    """Task de background para enriquecimento"""
    try:
        analysis = db.query(models.PageAnalysis).filter(
            models.PageAnalysis.id == analysis_id
        ).first()
        
        if not analysis:
            return
        
        company_name = analysis.title or "Unknown"
        from urllib.parse import urlparse
        domain = urlparse(analysis.url).netloc.replace('www.', '')
        
        enriched_data = await enrichment_service.enrich_company(domain, company_name)
        
        current_entities = json.loads(analysis.entities) if analysis.entities else {}
        current_entities['enriched_data'] = enriched_data
        
        analysis.entities = json.dumps(current_entities, ensure_ascii=False)
        db.commit()
        
        print(f"✅ Análise {analysis_id} enriquecida com sucesso")
        
    except Exception as e:
        print(f"❌ Erro ao enriquecer análise {analysis_id}: {e}")

