"""
Serviço de Enriquecimento Multi-Fonte
Busca dados de múltiplas fontes para criar perfil 360° da empresa
"""
import httpx
import json
import asyncio
from typing import Dict, Any, Optional, List
from bs4 import BeautifulSoup
from ..config import settings
import openai

class MultiSourceEnrichment:
    """
    Enriquece análise de empresa com múltiplas fontes:
    - LinkedIn (company data)
    - Crunchbase (funding)
    - GitHub (tech stack real)
    - News API (notícias recentes)
    - G2/Capterra (reviews)
    """
    
    def __init__(self):
        self.timeout = 15
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    
    async def enrich_company(self, domain: str, company_name: str) -> Dict[str, Any]:
        """
        Busca informações em múltiplas fontes e sintetiza com LLM
        
        Args:
            domain: Domínio da empresa (ex: openai.com)
            company_name: Nome da empresa (ex: OpenAI)
            
        Returns:
            Dict com dados enriquecidos e síntese por IA
        """
        print(f"🔍 Enriquecendo dados de {company_name}...")
        
        # Executa buscas em paralelo
        tasks = [
            self._fetch_crunchbase(company_name),
            self._fetch_github_org(company_name),
            self._fetch_linkedin_basic(company_name, domain),
            self._fetch_news(company_name),
            self._fetch_g2_reviews(company_name)
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filtra erros e organiza resultados
        enriched_data = {
            "crunchbase": results[0] if not isinstance(results[0], Exception) else None,
            "github": results[1] if not isinstance(results[1], Exception) else None,
            "linkedin": results[2] if not isinstance(results[2], Exception) else None,
            "news": results[3] if not isinstance(results[3], Exception) else None,
            "reviews": results[4] if not isinstance(results[4], Exception) else None
        }
        
        # Conta fontes bem-sucedidas
        successful_sources = sum(1 for v in enriched_data.values() if v is not None)
        print(f"✅ {successful_sources}/5 fontes enriquecidas com sucesso")
        
        # LLM sintetiza tudo em um perfil unificado
        synthesized = await self._synthesize_with_llm(enriched_data, company_name)
        
        return {
            "raw_data": enriched_data,
            "synthesized": synthesized,
            "sources_count": successful_sources,
            "enrichment_timestamp": self._get_timestamp()
        }
    
    async def _fetch_crunchbase(self, company_name: str) -> Optional[Dict]:
        """Busca dados do Crunchbase (funding, investimentos)"""
        try:
            print(f"  📊 Buscando Crunchbase...")
            
            # Se tiver API key do Crunchbase
            if hasattr(settings, 'CRUNCHBASE_API_KEY') and settings.CRUNCHBASE_API_KEY:
                url = f"https://api.crunchbase.com/api/v4/searches/organizations"
                headers = {
                    "X-cb-user-key": settings.CRUNCHBASE_API_KEY,
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "field_ids": ["name", "short_description", "funding_total", "num_funding_rounds"],
                    "query": [{"type": "predicate", "field_id": "name", "operator_id": "includes", "values": [company_name]}],
                    "limit": 1
                }
                
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        entities = data.get('entities', [])
                        if entities:
                            entity = entities[0]['properties']
                            return {
                                "name": entity.get('name'),
                                "description": entity.get('short_description'),
                                "funding_total": entity.get('funding_total', {}).get('value_usd'),
                                "funding_rounds": entity.get('num_funding_rounds')
                            }
            
            # Fallback: scraping público simplificado
            company_slug = company_name.lower().replace(' ', '-').replace('.', '')
            url = f"https://www.crunchbase.com/organization/{company_slug}"
            
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    
                    # Busca informações básicas na página
                    return {
                        "name": company_name,
                        "description": self._extract_meta_description(soup),
                        "url": url,
                        "source": "crunchbase_scraping"
                    }
                    
        except Exception as e:
            print(f"    ⚠️ Erro Crunchbase: {str(e)[:100]}")
        
        return None
    
    async def _fetch_github_org(self, company_name: str) -> Optional[Dict]:
        """Busca organização no GitHub (tech stack real)"""
        try:
            print(f"  💻 Buscando GitHub...")
            
            # Tenta variações do nome
            org_variants = [
                company_name.lower().replace(' ', '-'),
                company_name.lower().replace(' ', ''),
                company_name.lower()
            ]
            
            headers = {**self.headers}
            if hasattr(settings, 'GITHUB_TOKEN') and settings.GITHUB_TOKEN:
                headers["Authorization"] = f"token {settings.GITHUB_TOKEN}"
            
            for org_name in org_variants:
                try:
                    url = f"https://api.github.com/orgs/{org_name}"
                    
                    async with httpx.AsyncClient(timeout=self.timeout) as client:
                        resp = await client.get(url, headers=headers)
                        
                        if resp.status_code == 200:
                            data = resp.json()
                            
                            # Busca repositórios
                            repos_url = data.get('repos_url')
                            repos_resp = await client.get(repos_url, headers=headers)
                            repos = repos_resp.json() if repos_resp.status_code == 200 else []
                            
                            # Extrai tech stack dos repos
                            languages = {}
                            for repo in repos[:15]:  # Top 15 repos
                                if not repo.get('fork'):  # Ignora forks
                                    lang = repo.get('language')
                                    if lang:
                                        languages[lang] = languages.get(lang, 0) + repo.get('stargazers_count', 1)
                            
                            # Ordena por popularidade
                            top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:8]
                            
                            return {
                                "organization": data.get('login'),
                                "name": data.get('name'),
                                "description": data.get('description'),
                                "public_repos": data.get('public_repos'),
                                "followers": data.get('followers'),
                                "tech_stack": [lang for lang, _ in top_languages],
                                "top_languages": dict(top_languages),
                                "url": data.get('html_url')
                            }
                except:
                    continue
                    
        except Exception as e:
            print(f"    ⚠️ Erro GitHub: {str(e)[:100]}")
        
        return None
    
    async def _fetch_linkedin_basic(self, company_name: str, domain: str) -> Optional[Dict]:
        """Busca dados básicos do LinkedIn via scraping leve"""
        try:
            print(f"  👔 Buscando LinkedIn...")
            
            # Constrói URL do LinkedIn
            company_slug = company_name.lower().replace(' ', '-').replace('.', '')
            url = f"https://www.linkedin.com/company/{company_slug}"
            
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                resp = await client.get(url, headers=self.headers)
                
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    
                    # Extrai informações básicas
                    return {
                        "company_name": company_name,
                        "url": url,
                        "description": self._extract_meta_description(soup),
                        "source": "linkedin_basic"
                    }
                    
        except Exception as e:
            print(f"    ⚠️ Erro LinkedIn: {str(e)[:100]}")
        
        return None
    
    async def _fetch_news(self, company_name: str) -> Optional[Dict]:
        """Busca notícias recentes (News API ou scraping Google News)"""
        try:
            print(f"  📰 Buscando notícias...")
            
            # Opção 1: News API (se tiver chave)
            if hasattr(settings, 'NEWS_API_KEY') and settings.NEWS_API_KEY:
                url = "https://newsapi.org/v2/everything"
                params = {
                    "q": f'"{company_name}"',
                    "sortBy": "publishedAt",
                    "pageSize": 5,
                    "language": "en"
                }
                headers = {"X-Api-Key": settings.NEWS_API_KEY}
                
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    resp = await client.get(url, params=params, headers=headers)
                    
                    if resp.status_code == 200:
                        data = resp.json()
                        articles = data.get('articles', [])
                        
                        return {
                            "total_results": data.get('totalResults', 0),
                            "recent_news": [
                                {
                                    "title": a.get('title'),
                                    "description": a.get('description'),
                                    "url": a.get('url'),
                                    "published_at": a.get('publishedAt'),
                                    "source": a.get('source', {}).get('name')
                                }
                                for a in articles[:5]
                            ]
                        }
            
            # Opção 2: Google News scraping (fallback)
            search_query = f"{company_name} news"
            url = f"https://news.google.com/search?q={search_query}&hl=en-US&gl=US&ceid=US:en"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers=self.headers)
                
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    articles = soup.find_all('article', limit=5)
                    
                    news_list = []
                    for article in articles:
                        title_elem = article.find('h3') or article.find('h4')
                        if title_elem:
                            news_list.append({
                                "title": title_elem.get_text(strip=True),
                                "source": "google_news"
                            })
                    
                    if news_list:
                        return {
                            "total_results": len(news_list),
                            "recent_news": news_list
                        }
                    
        except Exception as e:
            print(f"    ⚠️ Erro News: {str(e)[:100]}")
        
        return None
    
    async def _fetch_g2_reviews(self, company_name: str) -> Optional[Dict]:
        """Busca reviews no G2/Capterra"""
        try:
            print(f"  ⭐ Buscando reviews...")
            
            # G2
            product_slug = company_name.lower().replace(' ', '-')
            url = f"https://www.g2.com/products/{product_slug}/reviews"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers=self.headers)
                
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    
                    # Tenta extrair rating (estrutura do G2 muda frequentemente)
                    rating = self._extract_rating(soup)
                    
                    return {
                        "platform": "G2",
                        "rating": rating,
                        "url": url,
                        "has_reviews": bool(rating)
                    }
                    
        except Exception as e:
            print(f"    ⚠️ Erro Reviews: {str(e)[:100]}")
        
        return None
    
    async def _synthesize_with_llm(self, data: Dict, company_name: str) -> Dict:
        """Usa LLM para sintetizar informações de todas as fontes"""
        
        # Prepara resumo das fontes
        sources_summary = []
        
        if data.get('crunchbase'):
            sources_summary.append(f"CRUNCHBASE: {json.dumps(data['crunchbase'], indent=2)}")
        
        if data.get('github'):
            sources_summary.append(f"GITHUB: {json.dumps(data['github'], indent=2)}")
        
        if data.get('linkedin'):
            sources_summary.append(f"LINKEDIN: {json.dumps(data['linkedin'], indent=2)}")
        
        if data.get('news'):
            sources_summary.append(f"NOTÍCIAS: {json.dumps(data['news'], indent=2)}")
        
        if data.get('reviews'):
            sources_summary.append(f"REVIEWS: {json.dumps(data['reviews'], indent=2)}")
        
        if not sources_summary:
            return {"error": "Nenhuma fonte disponível para síntese"}
        
        prompt = f"""Sintetize as informações sobre {company_name} de múltiplas fontes em um perfil executivo unificado.

INFORMAÇÕES COLETADAS:
{chr(10).join(sources_summary)}

Gere um perfil estruturado em JSON com estas seções obrigatórias:

{{
  "company_overview": "Overview executivo consolidado da empresa (150-250 palavras)",
  "funding_status": "Status de funding e investimentos (se disponível) ou 'Não identificado'",
  "tech_stack": ["tecnologia1", "tecnologia2"],
  "market_position": "Posição no mercado e indústria",
  "recent_activity": "Atividades e notícias recentes relevantes",
  "growth_signals": ["sinal de crescimento 1", "sinal 2"],
  "risk_factors": ["fator de risco 1", "risco 2"],
  "sales_approach": "Abordagem de vendas recomendada baseada nos dados",
  "key_insights": ["insight acionável 1", "insight 2", "insight 3"]
}}

INSTRUÇÕES:
- Seja específico e factual baseado nos dados fornecidos
- Se uma informação não estiver disponível, escreva "Não identificado" para aquele campo
- Foque em insights acionáveis para vendas B2B
- Use dados concretos quando disponíveis
"""
        
        try:
            resp = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "Você é um analista de mercado especializado em criar perfis executivos de empresas para equipes de vendas B2B."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = resp['choices'][0]['message']['content']
            
            # Extrai JSON
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                return result
            
        except Exception as e:
            print(f"⚠️ Erro ao sintetizar com LLM: {e}")
        
        return {
            "company_overview": f"Perfil de {company_name} baseado em múltiplas fontes.",
            "funding_status": "Não identificado",
            "tech_stack": data.get('github', {}).get('tech_stack', []),
            "market_position": "Análise em andamento",
            "recent_activity": "Ver fontes individuais",
            "growth_signals": [],
            "risk_factors": [],
            "sales_approach": "Abordagem consultiva recomendada",
            "key_insights": ["Múltiplas fontes analisadas", "Perfil em construção"]
        }
    
    # Métodos auxiliares
    def _extract_meta_description(self, soup) -> str:
        """Extrai meta description de uma página"""
        meta = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        return meta.get('content', 'Descrição não disponível') if meta else 'Descrição não disponível'
    
    def _extract_rating(self, soup) -> Optional[str]:
        """Extrai rating de review sites"""
        # Tenta vários seletores comuns
        rating_selectors = [
            {'class': 'stars'},
            {'class': 'rating'},
            {'itemprop': 'ratingValue'},
            {'data-rating': True}
        ]
        
        for selector in rating_selectors:
            elem = soup.find('div', selector) or soup.find('span', selector)
            if elem:
                return elem.get_text(strip=True) or elem.get('data-rating')
        
        return None
    
    def _get_timestamp(self) -> str:
        """Retorna timestamp atual"""
        from datetime import datetime
        return datetime.utcnow().isoformat()


# Instância global
enrichment_service = MultiSourceEnrichment()

