from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

# Modelos, schemas e dependências
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload
# Serviços de scraping e sumarização
from ..services.scraper import fetch_url
from ..services.llm import summarize_text
from ..services.text_formatter import format_content_for_display, format_title, format_summary, format_key_points


router = APIRouter()


@router.post("/", response_model=schemas.AnalyzeResponse)
async def analyze(request: schemas.AnalyzeRequest, db: Session = Depends(get_db), user=Depends(get_current_user_payload)):
    # Evita reprocessar a mesma URL (cache no banco)
    existing = db.query(models.PageAnalysis).filter(models.PageAnalysis.url == str(request.url)).first()
    if existing:
        return _to_response(existing)

    try:
        title, raw_text = await fetch_url(str(request.url))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {e}")

    llm_out = await summarize_text(raw_text)

    # Persiste resultado com deduplicação
    analysis = models.PageAnalysis(
        url=str(request.url),
        title=title,
        raw_text=raw_text,
        summary=llm_out.get("summary"),
        key_points=json.dumps(llm_out.get("key_points", [])),
        entities=json.dumps(llm_out.get("entities", {})),
        owner_id=int(user.get("sub")) if user else None,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return _to_response(analysis)


def _to_response(analysis: models.PageAnalysis) -> schemas.AnalyzeResponse:
    # Parseia JSON
    key_points = json.loads(analysis.key_points) if analysis.key_points else []
    entities = json.loads(analysis.entities) if analysis.entities else {}
    
    # Aplica formatação padronizada
    return schemas.AnalyzeResponse(
        id=analysis.id,
        url=analysis.url,
        title=format_title(analysis.title),
        summary=format_summary(analysis.summary),
        key_points=format_key_points(key_points),
        entities=entities,
        created_at=analysis.created_at,
    )


