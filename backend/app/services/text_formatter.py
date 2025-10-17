"""
Serviço de formatação e normalização de textos
Garante padronização em todo o sistema
"""
import re
from typing import Optional


def normalize_text(text: Optional[str]) -> str:
    """
    Normaliza e limpa um texto para exibição consistente.
    
    Args:
        text: Texto para normalizar
        
    Returns:
        Texto normalizado e limpo
    """
    if not text:
        return ""
    
    # Remove múltiplos espaços
    text = re.sub(r'\s+', ' ', text)
    
    # Remove espaços no início e fim
    text = text.strip()
    
    # Remove quebras de linha extras
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    
    # Normaliza pontuação com espaço
    text = re.sub(r'\s*([.,;:!?])\s*', r'\1 ', text)
    
    # Remove espaço antes de pontuação
    text = re.sub(r'\s+([.,;:!?])', r'\1', text)
    
    return text.strip()


def format_summary(summary: Optional[str]) -> str:
    """
    Formata um resumo para exibição padronizada.
    
    Args:
        summary: Resumo para formatar
        
    Returns:
        Resumo formatado
    """
    if not summary:
        return "Resumo não disponível."
    
    # Normaliza o texto
    text = normalize_text(summary)
    
    # Garante que termina com ponto
    if text and not text[-1] in '.!?':
        text += '.'
    
    # Capitaliza primeira letra
    if text:
        text = text[0].upper() + text[1:]
    
    return text


def format_title(title: Optional[str]) -> str:
    """
    Formata um título para exibição padronizada.
    
    Args:
        title: Título para formatar
        
    Returns:
        Título formatado
    """
    if not title:
        return "Título não disponível"
    
    # Normaliza o texto
    text = normalize_text(title)
    
    # Remove pontuação final de títulos
    text = text.rstrip('.,;:')
    
    # Limita tamanho
    if len(text) > 150:
        text = text[:147] + '...'
    
    return text


def format_key_points(key_points: list) -> list:
    """
    Formata lista de pontos-chave para exibição padronizada.
    
    Args:
        key_points: Lista de pontos
        
    Returns:
        Lista formatada
    """
    if not key_points:
        return []
    
    formatted = []
    for point in key_points:
        if not point:
            continue
            
        # Normaliza o texto
        text = normalize_text(str(point))
        
        # Remove marcadores comuns
        text = re.sub(r'^[-•*]\s*', '', text)
        
        # Garante capitalização
        if text:
            text = text[0].upper() + text[1:]
        
        # Garante ponto final
        if text and not text[-1] in '.!?':
            text += '.'
        
        formatted.append(text)
    
    return formatted


def clean_html_text(text: str) -> str:
    """
    Remove tags HTML e normaliza texto extraído de páginas web.
    
    Args:
        text: Texto com possível HTML
        
    Returns:
        Texto limpo
    """
    if not text:
        return ""
    
    # Remove tags HTML residuais
    text = re.sub(r'<[^>]+>', '', text)
    
    # Remove entidades HTML comuns
    text = text.replace('&nbsp;', ' ')
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&quot;', '"')
    text = text.replace('&#39;', "'")
    
    # Normaliza
    return normalize_text(text)


def truncate_text(text: str, max_length: int = 500, suffix: str = '...') -> str:
    """
    Trunca texto de forma inteligente, preservando palavras completas.
    
    Args:
        text: Texto para truncar
        max_length: Tamanho máximo
        suffix: Sufixo a adicionar quando truncar
        
    Returns:
        Texto truncado
    """
    if not text or len(text) <= max_length:
        return text
    
    # Trunca no limite
    truncated = text[:max_length]
    
    # Volta até o último espaço para não cortar palavra
    last_space = truncated.rfind(' ')
    if last_space > 0:
        truncated = truncated[:last_space]
    
    return truncated.rstrip('.,;:') + suffix


def format_url(url: Optional[str]) -> str:
    """
    Formata URL para exibição.
    
    Args:
        url: URL para formatar
        
    Returns:
        URL formatada
    """
    if not url:
        return ""
    
    # Remove espaços
    url = url.strip()
    
    # Garante protocolo
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    return url


def format_content_for_display(content: dict) -> dict:
    """
    Formata todo o conteúdo de uma análise para exibição.
    
    Args:
        content: Dicionário com campos da análise
        
    Returns:
        Dicionário com campos formatados
    """
    return {
        'title': format_title(content.get('title')),
        'url': format_url(content.get('url')),
        'summary': format_summary(content.get('summary')),
        'key_points': format_key_points(content.get('key_points', [])),
        'entities': content.get('entities', {}),
        'created_at': content.get('created_at')
    }

