"""
Serviço de busca na web para enriquecer respostas do RAG
Faz pesquisas automáticas no Google e extrai informações relevantes
"""
from typing import List, Dict, Any
import httpx
from bs4 import BeautifulSoup
import json
import re


async def google_search(query: str, num_results: int = 5) -> List[Dict[str, Any]]:
    """
    Realiza busca no Google e retorna resultados estruturados.
    
    Args:
        query: Termo de busca
        num_results: Número de resultados a retornar
        
    Returns:
        Lista de resultados com {title, url, snippet}
    """
    try:
        # Monta URL de busca do Google
        search_url = f"https://www.google.com/search?q={query}&num={num_results}"
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        async with httpx.AsyncClient(timeout=15, headers=headers) as client:
            response = await client.get(search_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            results = []
            
            # Procura por divs de resultado do Google
            search_results = soup.find_all('div', class_='g')
            
            for result in search_results[:num_results]:
                try:
                    # Extrai título
                    title_elem = result.find('h3')
                    title = title_elem.get_text() if title_elem else ""
                    
                    # Extrai URL
                    link_elem = result.find('a')
                    url = link_elem['href'] if link_elem and 'href' in link_elem.attrs else ""
                    
                    # Extrai snippet/descrição
                    snippet_elem = result.find('div', class_=['VwiC3b', 'yXK7lf'])
                    snippet = snippet_elem.get_text() if snippet_elem else ""
                    
                    if title and url:
                        results.append({
                            'title': title,
                            'url': url,
                            'snippet': snippet
                        })
                except Exception as e:
                    continue
            
            return results
            
    except Exception as e:
        print(f"Erro ao buscar no Google: {e}")
        return []


async def duckduckgo_search(query: str, num_results: int = 5) -> List[Dict[str, Any]]:
    """
    Busca alternativa usando DuckDuckGo (mais simples e sem bloqueios).
    
    Args:
        query: Termo de busca
        num_results: Número de resultados
        
    Returns:
        Lista de resultados
    """
    try:
        # DuckDuckGo Instant Answer API (sem necessidade de chave)
        api_url = f"https://api.duckduckgo.com/?q={query}&format=json&no_html=1"
        
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(api_url)
            data = response.json()
            
            results = []
            
            # Processa resultados relacionados
            for item in data.get('RelatedTopics', [])[:num_results]:
                if isinstance(item, dict) and 'Text' in item:
                    results.append({
                        'title': item.get('Text', '')[:100],
                        'url': item.get('FirstURL', ''),
                        'snippet': item.get('Text', '')
                    })
            
            return results
            
    except Exception as e:
        print(f"Erro ao buscar no DuckDuckGo: {e}")
        return []


async def web_search(query: str, num_results: int = 5) -> List[Dict[str, Any]]:
    """
    Função principal de busca web com fallback.
    Tenta Google primeiro, depois DuckDuckGo.
    
    Args:
        query: Termo de busca
        num_results: Número de resultados
        
    Returns:
        Lista de resultados da web
    """
    # Tenta Google primeiro
    results = await google_search(query, num_results)
    
    # Se falhar, tenta DuckDuckGo
    if not results:
        results = await duckduckgo_search(query, num_results)
    
    return results


async def scrape_url_content(url: str) -> str:
    """
    Faz scraping do conteúdo de uma URL específica.
    
    Args:
        url: URL para fazer scraping
        
    Returns:
        Texto extraído da página
    """
    try:
        async with httpx.AsyncClient(timeout=10, headers={"User-Agent": "Mozilla/5.0"}) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts e styles
            for tag in soup(['script', 'style', 'noscript']):
                tag.decompose()
            
            # Extrai texto limpo
            text = soup.get_text(separator=' ', strip=True)
            text = ' '.join(text.split())  # Remove espaços extras
            
            return text[:5000]  # Limita tamanho
            
    except Exception as e:
        print(f"Erro ao fazer scraping de {url}: {e}")
        return ""


async def enriched_search(query: str, scrape_top_results: bool = False) -> Dict[str, Any]:
    """
    Busca enriquecida que retorna resultados + conteúdo (opcional).
    
    Args:
        query: Termo de busca
        scrape_top_results: Se True, faz scraping dos top 2 resultados
        
    Returns:
        Dicionário com resultados e conteúdo enriquecido
    """
    # Faz busca web
    results = await web_search(query, num_results=5)
    
    enriched_results = {
        'query': query,
        'results': results,
        'scraped_content': []
    }
    
    # Opcionalmente faz scraping dos top resultados
    if scrape_top_results and results:
        for result in results[:2]:  # Top 2
            content = await scrape_url_content(result['url'])
            if content:
                enriched_results['scraped_content'].append({
                    'url': result['url'],
                    'title': result['title'],
                    'content': content
                })
    
    return enriched_results

