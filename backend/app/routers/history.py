from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import csv
import io
from datetime import datetime

# Modelos, schemas e dependências
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload
from ..services.text_formatter import format_title, format_summary, format_key_points


router = APIRouter()


@router.get("/", response_model=list[schemas.HistoryItem])
def list_history(db: Session = Depends(get_db), user=Depends(get_current_user_payload)):
    q = db.query(models.PageAnalysis)
    # Se não for admin, restringe ao dono
    if not user or user.get("role") != "admin":
        q = q.filter(models.PageAnalysis.owner_id == int(user.get("sub")))
    rows = q.order_by(models.PageAnalysis.created_at.desc()).limit(100).all()
    return [
        schemas.HistoryItem(
            id=r.id,
            url=r.url,
            title=format_title(r.title),
            summary=format_summary(r.summary),
            key_points=format_key_points(json.loads(r.key_points) if r.key_points else []),
            entities=json.loads(r.entities) if r.entities else None,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/export/csv")
def export_history_csv(db: Session = Depends(get_db), user=Depends(get_current_user_payload)):
    """
    Exporta histórico de análises para CSV formatado para Google Sheets.
    """
    q = db.query(models.PageAnalysis)
    # Se não for admin, restringe ao dono
    if not user or user.get("role") != "admin":
        q = q.filter(models.PageAnalysis.owner_id == int(user.get("sub")))
    rows = q.order_by(models.PageAnalysis.created_at.desc()).all()
    
    # Cria CSV em memória
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Cabeçalho formatado
    writer.writerow([
        'ID',
        'Data de Análise',
        'URL',
        'Título',
        'Resumo',
        'Pontos-Chave',
        'Empresa',
        'Produtos',
        'Preços',
        'Stack Tecnológico',
        'Contatos'
    ])
    
    # Dados
    for r in rows:
        # Parse key_points
        key_points = json.loads(r.key_points) if r.key_points else []
        key_points_formatted = format_key_points(key_points)
        key_points_text = ' | '.join(key_points_formatted) if key_points_formatted else 'N/A'
        
        # Parse entities
        entities = json.loads(r.entities) if r.entities else {}
        
        # Extrai campos das entidades
        company = entities.get('company_name', 'N/A')
        products = ', '.join(entities.get('products', [])) if entities.get('products') else 'N/A'
        pricing = entities.get('pricing', 'N/A')
        tech_stack = ', '.join(entities.get('tech_stack', [])) if entities.get('tech_stack') else 'N/A'
        contacts = ', '.join(entities.get('contacts', [])) if entities.get('contacts') else 'N/A'
        
        # Formata data
        date_str = r.created_at.strftime('%d/%m/%Y %H:%M') if r.created_at else 'N/A'
        
        writer.writerow([
            r.id,
            date_str,
            r.url,
            format_title(r.title),
            format_summary(r.summary),
            key_points_text,
            company,
            products,
            pricing,
            tech_stack,
            contacts
        ])
    
    # Prepara resposta
    output.seek(0)
    
    # Nome do arquivo com timestamp
    filename = f"analises_bna_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


