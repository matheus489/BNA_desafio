"""
Router para geração de relatórios PDF detalhados
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
import io
import json
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.utils import ImageReader

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload
from ..services.llm import generate_detailed_report
from ..config import settings

router = APIRouter()


def add_watermark(canvas, doc):
    """
    Adiciona marca d'água (logo BNA) em cada página do PDF.
    """
    try:
        # Caminho para a logo
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'logo.png')
        
        if os.path.exists(logo_path):
            # Salva o estado atual do canvas
            canvas.saveState()
            
            # Define transparência (0.0 = invisível, 1.0 = opaco)
            canvas.setFillAlpha(0.1)
            
            # Dimensões da página A4
            page_width, page_height = A4
            
            # Tamanho da marca d'água
            watermark_size = 150
            
            # Posição: centro da página
            x = (page_width - watermark_size) / 2
            y = (page_height - watermark_size) / 2
            
            # Desenha a imagem como marca d'água
            canvas.drawImage(
                logo_path,
                x, y,
                width=watermark_size,
                height=watermark_size,
                mask='auto',
                preserveAspectRatio=True
            )
            
            # Restaura o estado do canvas
            canvas.restoreState()
            
    except Exception as e:
        print(f"Erro ao adicionar marca d'água: {e}")
        # Continua sem marca d'água se houver erro


@router.post("/generate/{analysis_id}")
async def generate_report(
    analysis_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Gera um relatório PDF detalhado usando IA para uma análise específica.
    
    O relatório será mais detalhado que a análise original, usando IA para
    expandir e enriquecer o conteúdo com insights adicionais.
    """
    user_id = int(user.get("sub"))
    
    # Busca a análise no banco
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id,
        models.PageAnalysis.owner_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    try:
        # Gera relatório detalhado usando IA
        detailed_content = await generate_detailed_report(analysis)
        
        # Cria o PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Estilos
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            alignment=TA_JUSTIFY
        )
        
        # Conteúdo do PDF
        story = []
        
        # Título
        story.append(Paragraph("RELATÓRIO DETALHADO DE ANÁLISE", title_style))
        story.append(Spacer(1, 20))
        
        # Informações básicas
        story.append(Paragraph("INFORMAÇÕES BÁSICAS", heading_style))
        story.append(Paragraph(f"<b>URL:</b> {analysis.url}", body_style))
        story.append(Paragraph(f"<b>Título:</b> {analysis.title or 'N/A'}", body_style))
        story.append(Paragraph(f"<b>Data da Análise:</b> {analysis.created_at.strftime('%d/%m/%Y %H:%M')}", body_style))
        story.append(Spacer(1, 20))
        
        # Resumo expandido
        if detailed_content.get('expanded_summary'):
            story.append(Paragraph("RESUMO EXECUTIVO EXPANDIDO", heading_style))
            story.append(Paragraph(detailed_content['expanded_summary'], body_style))
            story.append(Spacer(1, 20))
        
        # Análise de mercado
        if detailed_content.get('market_analysis'):
            story.append(Paragraph("ANÁLISE DE MERCADO", heading_style))
            story.append(Paragraph(detailed_content['market_analysis'], body_style))
            story.append(Spacer(1, 20))
        
        # Oportunidades de vendas
        if detailed_content.get('sales_opportunities'):
            story.append(Paragraph("OPORTUNIDADES DE VENDAS", heading_style))
            story.append(Paragraph(detailed_content['sales_opportunities'], body_style))
            story.append(Spacer(1, 20))
        
        # Stack tecnológico
        if detailed_content.get('tech_stack'):
            story.append(Paragraph("STACK TECNOLÓGICO", heading_style))
            story.append(Paragraph(detailed_content['tech_stack'], body_style))
            story.append(Spacer(1, 20))
        
        # Estratégia de abordagem
        if detailed_content.get('approach_strategy'):
            story.append(Paragraph("ESTRATÉGIA DE ABORDAGEM", heading_style))
            story.append(Paragraph(detailed_content['approach_strategy'], body_style))
            story.append(Spacer(1, 20))
        
        # Insights adicionais
        if detailed_content.get('additional_insights'):
            story.append(Paragraph("INSIGHTS ADICIONAIS", heading_style))
            story.append(Paragraph(detailed_content['additional_insights'], body_style))
            story.append(Spacer(1, 20))
        
        # Constrói o PDF com marca d'água em cada página
        doc.build(story, onFirstPage=add_watermark, onLaterPages=add_watermark)
        buffer.seek(0)
        
        # Retorna o PDF como stream
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=relatorio_detalhado_{analysis_id}.pdf"}
        )
        
    except Exception as e:
        print(f"Erro ao gerar relatório: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")


@router.get("/status/{analysis_id}")
def get_report_status(
    analysis_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """Verifica se um relatório pode ser gerado para uma análise."""
    user_id = int(user.get("sub"))
    
    analysis = db.query(models.PageAnalysis).filter(
        models.PageAnalysis.id == analysis_id,
        models.PageAnalysis.owner_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    return {
        "can_generate": True,
        "analysis_id": analysis_id,
        "title": analysis.title,
        "url": analysis.url
    }
