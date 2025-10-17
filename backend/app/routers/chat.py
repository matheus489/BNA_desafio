"""
Router de Chat RAG (Retrieval-Augmented Generation)

Combina:
- Busca vetorial no histórico de análises (RAG)
- Pesquisa automática na web
- LLM (GPT-4) para gerar respostas contextualizadas
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any
import json

from .. import models, schemas
from ..database import get_db
from ..security import get_current_user_payload
from ..services.embeddings import find_similar_analyses
from ..services.web_search import enriched_search
from ..config import settings


router = APIRouter()


@router.post("/", response_model=schemas.ChatResponse)
async def chat(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """
    Endpoint principal do chat RAG.
    
    Fluxo:
    1. Busca análises similares no banco (RAG)
    2. Opcionalmente faz web search
    3. Monta contexto rico
    4. Envia para GPT-4
    5. Salva pergunta e resposta no histórico
    """
    user_id = int(user.get("sub"))
    
    # ===== 1. RAG: Busca vetorial no histórico =====
    all_analyses = db.query(models.PageAnalysis).all()
    analyses_data = [
        {
            'id': a.id,
            'url': a.url,
            'title': a.title,
            'summary': a.summary,
            'raw_text': a.raw_text,
            'key_points': a.key_points,
            'entities': a.entities
        }
        for a in all_analyses
    ]
    
    similar_analyses = await find_similar_analyses(
        request.message,
        analyses_data,
        top_k=3
    )
    
    # ===== 2. Web Search (se habilitado) =====
    web_results = []
    if request.use_web_search:
        enriched = await enriched_search(
            request.message,
            scrape_top_results=True  # Faz scraping dos top 2 resultados
        )
        web_results = enriched.get('results', [])
        scraped_content = enriched.get('scraped_content', [])
    else:
        scraped_content = []
    
    # ===== 3. Busca histórico de conversa recente =====
    chat_history = db.query(models.ChatMessage)\
        .filter(models.ChatMessage.user_id == user_id)\
        .order_by(models.ChatMessage.created_at.desc())\
        .limit(request.max_history)\
        .all()
    chat_history.reverse()  # Ordem cronológica
    
    # ===== 4. Monta contexto para o LLM =====
    context_parts = []
    
    # Contexto de análises do banco (RAG)
    if similar_analyses:
        context_parts.append("=== ANÁLISES RELEVANTES NO BANCO DE DADOS ===")
        for i, analysis in enumerate(similar_analyses, 1):
            context_parts.append(f"\n[Análise {i}]")
            context_parts.append(f"URL: {analysis['url']}")
            context_parts.append(f"Título: {analysis['title']}")
            context_parts.append(f"Resumo: {analysis['summary']}")
            if analysis.get('key_points'):
                try:
                    kp = json.loads(analysis['key_points']) if isinstance(analysis['key_points'], str) else analysis['key_points']
                    context_parts.append(f"Pontos-chave: {', '.join(kp)}")
                except:
                    pass
            context_parts.append(f"Similaridade: {analysis.get('similarity_score', 0):.2f}")
    
    # Contexto de busca na web
    if web_results:
        context_parts.append("\n\n=== RESULTADOS DA BUSCA NA WEB ===")
        for i, result in enumerate(web_results[:5], 1):
            context_parts.append(f"\n[Resultado {i}]")
            context_parts.append(f"Título: {result['title']}")
            context_parts.append(f"URL: {result['url']}")
            context_parts.append(f"Snippet: {result['snippet']}")
    
    # Conteúdo scrapeado da web
    if scraped_content:
        context_parts.append("\n\n=== CONTEÚDO DETALHADO DA WEB ===")
        for i, content in enumerate(scraped_content, 1):
            context_parts.append(f"\n[Página {i}]")
            context_parts.append(f"URL: {content['url']}")
            context_parts.append(f"Conteúdo: {content['content'][:2000]}")
    
    full_context = "\n".join(context_parts)
    
    # ===== 5. Monta histórico de conversa para GPT =====
    conversation_history = []
    for msg in chat_history[-6:]:  # Últimas 6 mensagens
        conversation_history.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # ===== 6. Chama GPT-4 com contexto rico =====
    response_text = await generate_rag_response(
        user_message=request.message,
        context=full_context,
        conversation_history=conversation_history
    )
    
    # ===== 7. Prepara fontes usadas =====
    sources = []
    
    # Adiciona análises como fontes
    for analysis in similar_analyses[:3]:
        sources.append(schemas.ChatSource(
            type='database',
            title=analysis['title'] or 'Análise sem título',
            url=analysis['url'],
            snippet=analysis['summary'][:200] if analysis.get('summary') else None
        ))
    
    # Adiciona resultados web como fontes
    for result in web_results[:3]:
        sources.append(schemas.ChatSource(
            type='web',
            title=result['title'],
            url=result['url'],
            snippet=result['snippet']
        ))
    
    # ===== 8. Salva no histórico do banco =====
    sources_json = json.dumps([s.dict() for s in sources])
    
    # Salva pergunta do usuário
    user_msg = models.ChatMessage(
        user_id=user_id,
        role='user',
        content=request.message,
        sources=None
    )
    db.add(user_msg)
    
    # Salva resposta do assistente
    assistant_msg = models.ChatMessage(
        user_id=user_id,
        role='assistant',
        content=response_text,
        sources=sources_json
    )
    db.add(assistant_msg)
    db.commit()
    
    # ===== 9. Retorna resposta =====
    return schemas.ChatResponse(
        message=response_text,
        sources=sources,
        timestamp=datetime.utcnow()
    )


@router.get("/history", response_model=List[schemas.ChatHistoryItem])
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """Retorna histórico de chat do usuário."""
    user_id = int(user.get("sub"))
    
    messages = db.query(models.ChatMessage)\
        .filter(models.ChatMessage.user_id == user_id)\
        .order_by(models.ChatMessage.created_at.desc())\
        .limit(limit)\
        .all()
    
    messages.reverse()  # Ordem cronológica
    
    result = []
    for msg in messages:
        sources = None
        if msg.sources:
            try:
                sources = json.loads(msg.sources)
            except:
                pass
        
        result.append(schemas.ChatHistoryItem(
            id=msg.id,
            role=msg.role,
            content=msg.content,
            sources=sources,
            created_at=msg.created_at
        ))
    
    return result


@router.delete("/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_payload)
):
    """Limpa todo o histórico de chat do usuário."""
    user_id = int(user.get("sub"))
    
    db.query(models.ChatMessage)\
        .filter(models.ChatMessage.user_id == user_id)\
        .delete()
    db.commit()
    
    return {"message": "Chat history cleared"}


async def generate_rag_response(
    user_message: str,
    context: str,
    conversation_history: List[Dict[str, str]]
) -> str:
    """
    Gera resposta usando GPT-4 com contexto RAG.
    
    Args:
        user_message: Pergunta do usuário
        context: Contexto montado (análises + web)
        conversation_history: Histórico de conversa
        
    Returns:
        Resposta gerada pelo LLM
    """
    try:
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        
        system_prompt = """Você é um assistente de vendas inteligente da BNA.dev.

Seu papel é ajudar o time de vendas a pesquisar e entender empresas antes de reuniões.

Você tem acesso a:
1. Análises de sites já realizadas (banco de dados)
2. Resultados de pesquisa na web em tempo real
3. Conteúdo detalhado scrapeado da internet

INSTRUÇÕES:
- Responda de forma objetiva, clara e focada em vendas
- Sempre cite suas fontes quando mencionar informações específicas
- Se não encontrar informação, seja honesto
- Priorize informações sobre: ICP, produtos, pricing, stack tecnológico, contatos
- Use tom profissional mas amigável
- Se possível, dê insights estratégicos para a abordagem de vendas

FORMATO DE RESPOSTA:
- Responda de forma estruturada
- Use bullet points quando apropriado
- Destaque informações-chave
- Seja conciso mas completo"""

        # Monta mensagens para GPT
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Adiciona histórico de conversa
        messages.extend(conversation_history)
        
        # Adiciona pergunta atual com contexto
        user_content = f"""CONTEXTO DISPONÍVEL:
{context}

===========================

PERGUNTA DO USUÁRIO:
{user_message}

Por favor, responda a pergunta usando o contexto fornecido. Se usar informações específicas, mencione a fonte."""

        messages.append({"role": "user", "content": user_content})
        
        # Chama GPT-4
        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )
        
        return response['choices'][0]['message']['content']
        
    except Exception as e:
        print(f"Erro ao gerar resposta RAG: {e}")
        return f"Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente. (Erro: {str(e)})"

