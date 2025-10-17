from typing import Tuple
import httpx
from bs4 import BeautifulSoup


async def fetch_url(url: str, timeout_s: int = 20) -> Tuple[str, str]:
    """Baixa HTML de uma URL e extrai título e texto limpo.

    - Usa httpx com User-Agent para evitar bloqueios básicos
    - Remove tags script/style/noscript
    - Retorna texto truncado para evitar payloads muito grandes
    """
    async with httpx.AsyncClient(timeout=timeout_s, headers={"User-Agent": "Mozilla/5.0"}) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        html = resp.text
        soup = BeautifulSoup(html, "html.parser")
        # Remove script e style para limpar o texto
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        title = soup.title.string.strip() if soup.title and soup.title.string else None
        text = " ".join(soup.get_text(separator=" ").split())
        return title or "", text[:200000]  # limite de segurança


