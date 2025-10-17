"""
Serviço de embeddings vetoriais para RAG (Retrieval-Augmented Generation)
Usa OpenAI Embeddings API para criar vetores semânticos
"""
from typing import List, Dict, Any
import numpy as np
from ..config import settings


async def generate_embedding(text: str) -> List[float]:
    """
    Gera embedding vetorial para um texto usando OpenAI.
    
    Args:
        text: Texto para gerar embedding
        
    Returns:
        Lista de floats representando o vetor de embedding
    """
    try:
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        
        # Trunca texto para evitar erro de limite
        text = text[:8000]
        
        # Usa modelo de embeddings da OpenAI (ada-002 é o melhor custo-benefício)
        response = await openai.Embedding.acreate(
            model="text-embedding-ada-002",
            input=text
        )
        
        return response['data'][0]['embedding']
    except Exception as e:
        print(f"Erro ao gerar embedding: {e}")
        # Fallback: retorna vetor zero
        return [0.0] * 1536  # dimensão do ada-002


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calcula similaridade de cosseno entre dois vetores.
    
    Args:
        vec1: Primeiro vetor
        vec2: Segundo vetor
        
    Returns:
        Score de similaridade (0-1, sendo 1 = idêntico)
    """
    try:
        a = np.array(vec1)
        b = np.array(vec2)
        
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return float(dot_product / (norm_a * norm_b))
    except Exception as e:
        print(f"Erro ao calcular similaridade: {e}")
        return 0.0


async def find_similar_analyses(query: str, analyses: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Encontra análises similares à query usando busca vetorial.
    
    Args:
        query: Pergunta/consulta do usuário
        analyses: Lista de análises do banco (com campos: id, url, title, summary, raw_text)
        top_k: Número de resultados mais similares a retornar
        
    Returns:
        Lista de análises ranqueadas por similaridade
    """
    if not analyses:
        return []
    
    # Gera embedding da query
    query_embedding = await generate_embedding(query)
    
    # Calcula similaridade com cada análise
    scored_analyses = []
    for analysis in analyses:
        # Combina campos relevantes para busca
        search_text = f"""
        Título: {analysis.get('title', '')}
        URL: {analysis.get('url', '')}
        Resumo: {analysis.get('summary', '')}
        Texto: {analysis.get('raw_text', '')[:3000]}
        """
        
        # Gera embedding do documento
        doc_embedding = await generate_embedding(search_text)
        
        # Calcula similaridade
        similarity = cosine_similarity(query_embedding, doc_embedding)
        
        scored_analyses.append({
            **analysis,
            'similarity_score': similarity
        })
    
    # Ordena por similaridade (maior primeiro)
    scored_analyses.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    # Retorna top K
    return scored_analyses[:top_k]

