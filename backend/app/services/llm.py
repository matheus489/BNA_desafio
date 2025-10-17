from typing import List, Dict, Any
import json
from ..config import settings

SUMMARY_PROMPT = """Você é um assistente especializado em análise de empresas para discovery de vendas.

Analise o texto fornecido e extraia informações estruturadas seguindo EXATAMENTE este formato:

## RESUMO EXECUTIVO
[Resumo conciso de 120-200 palavras sobre a empresa, seus produtos/serviços e proposta de valor]

## INFORMAÇÕES PRINCIPAIS

### 🎯 ICP (Ideal Customer Profile)
[Descrição do perfil ideal de cliente da empresa]

### 🛍️ PRODUTOS/SERVIÇOS
[Lista dos principais produtos ou serviços oferecidos]

### 💰 PRICING
[Informações sobre preços, planos ou modelo de cobrança]

### 🔧 STACK TECNOLÓGICO
[Tecnologias, linguagens, frameworks ou ferramentas utilizadas]

### 📞 CONTATOS
[Informações de contato disponíveis - emails, telefones, endereços]

### 🏢 SOBRE A EMPRESA
[Informações sobre a empresa: tamanho, localização, mercado, etc.]

### 🎯 OPORTUNIDADES DE VENDAS
[Insights sobre como abordar esta empresa, pain points identificados, etc.]

## ENTIDADES ESTRUTURADAS
{{
  "company_name": "[Nome da empresa]",
  "products": ["[produto1]", "[produto2]"],
  "pricing": "[Informações de preço]",
  "tech_stack": ["[tecnologia1]", "[tecnologia2]"],
  "contacts": ["[contato1]", "[contato2]"]
}}

IMPORTANTE: 
- Use formatação markdown consistente
- Seja específico e factual
- Foque em informações úteis para vendas
- Se alguma informação não estiver disponível, escreva "Não especificado"
- Mantenha o tom profissional e objetivo"""


async def summarize_text(raw_text: str) -> Dict[str, Any]:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openai":
        try:
            import openai  # type: ignore
        except Exception:  # pragma: no cover
            raise RuntimeError("openai package not installed")

        openai.api_key = settings.OPENAI_API_KEY
        content = (
            f"{SUMMARY_PROMPT}\n\nTEXTO:\n" + raw_text[:6000]
        )
        resp = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": content}],
            temperature=0.2,
        )
        text = resp["choices"][0]["message"]["content"]
        return _parse_output(text)

    # Fallback de resumo inteligente se não houver provider/chave
    return _extract_mock_analysis(raw_text)


def _parse_output(text: str) -> Dict[str, Any]:
    """Parser melhorado para extrair informações estruturadas do texto formatado."""
    summary = text.strip()
    key_points: List[str] = []
    entities: Dict[str, Any] = {}
    
    # Extrai JSON das entidades estruturadas
    try:
        # Procura por seção "ENTIDADES ESTRUTURADAS"
        entities_start = text.find("## ENTIDADES ESTRUTURADAS")
        if entities_start != -1:
            json_start = text.find("{", entities_start)
            json_end = text.rfind("}", json_start)
            if json_start != -1 and json_end != -1 and json_end > json_start:
                json_str = text[json_start:json_end + 1]
            entities = json.loads(json_str)
    except Exception:
        pass
    
    # Extrai resumo executivo
    summary_start = text.find("## RESUMO EXECUTIVO")
    if summary_start != -1:
        # Pega o texto até a próxima seção
        next_section = text.find("## ", summary_start + 1)
        if next_section != -1:
            summary = text[summary_start:next_section].replace("## RESUMO EXECUTIVO", "").strip()
        else:
            summary = text[summary_start:].replace("## RESUMO EXECUTIVO", "").strip()
    
    # Extrai pontos-chave das seções principais
    sections_to_extract = [
        "🎯 ICP (Ideal Customer Profile)",
        "🛍️ PRODUTOS/SERVIÇOS", 
        "💰 PRICING",
        "🔧 STACK TECNOLÓGICO",
        "📞 CONTATOS",
        "🏢 SOBRE A EMPRESA",
        "🎯 OPORTUNIDADES DE VENDAS"
    ]
    
    for section in sections_to_extract:
        section_start = text.find(f"### {section}")
        if section_start != -1:
            # Pega o conteúdo da seção até a próxima ### ou ##
            next_section = text.find("### ", section_start + 1)
            if next_section == -1:
                next_section = text.find("## ", section_start + 1)
            
            if next_section != -1:
                section_content = text[section_start:next_section].replace(f"### {section}", "").strip()
            else:
                section_content = text[section_start:].replace(f"### {section}", "").strip()
            
            if section_content and section_content != "Não especificado":
                key_points.append(f"{section}: {section_content}")
    
    # Se não encontrou seções estruturadas, usa o parser antigo
    if not key_points:
        for line in summary.splitlines():
            s = line.strip("- *•\t ")
            if len(s) > 0 and (line.strip().startswith(('-', '*', '•')) or s.endswith(';')):
                key_points.append(s)
    
    return {"summary": summary.strip(), "key_points": key_points, "entities": entities}


def _extract_mock_analysis(raw_text: str) -> Dict[str, Any]:
    """Análise mock inteligente que extrai informações básicas do texto."""
    import re
    
    # Extrai título (primeira linha significativa)
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    title = lines[0] if lines else "Título não encontrado"
    
    # Gera resumo estruturado
    summary = f"""## RESUMO EXECUTIVO
{_generate_smart_summary(raw_text, title)}

## INFORMAÇÕES PRINCIPAIS

### 🎯 ICP (Ideal Customer Profile)
{_extract_icp(raw_text)}

### 🛍️ PRODUTOS/SERVIÇOS
{_extract_products_formatted(raw_text)}

### 💰 PRICING
{_extract_pricing(raw_text)}

### 🔧 STACK TECNOLÓGICO
{_extract_tech_stack_formatted(raw_text)}

### 📞 CONTATOS
{_extract_contacts_formatted(raw_text)}

### 🏢 SOBRE A EMPRESA
{_extract_company_info(raw_text)}

### 🎯 OPORTUNIDADES DE VENDAS
{_extract_opportunities(raw_text)}"""
    
    # Extrai pontos-chave das seções
    key_points = []
    sections = [
        ("🎯 ICP (Ideal Customer Profile)", _extract_icp(raw_text)),
        ("🛍️ PRODUTOS/SERVIÇOS", _extract_products_formatted(raw_text)),
        ("💰 PRICING", _extract_pricing(raw_text)),
        ("🔧 STACK TECNOLÓGICO", _extract_tech_stack_formatted(raw_text)),
        ("📞 CONTATOS", _extract_contacts_formatted(raw_text)),
        ("🏢 SOBRE A EMPRESA", _extract_company_info(raw_text)),
        ("🎯 OPORTUNIDADES DE VENDAS", _extract_opportunities(raw_text))
    ]
    
    for section_title, content in sections:
        if content and content != "Não especificado":
            key_points.append(f"{section_title}: {content}")
    
    # Extrai entidades básicas
    entities = {
        "company_name": _extract_company_name(raw_text),
        "products": _extract_products(raw_text),
        "pricing": _extract_pricing(raw_text),
        "tech_stack": _extract_tech_stack(raw_text),
        "contacts": _extract_contacts(raw_text)
    }
    
    return {
        "summary": summary,
        "key_points": key_points,
        "entities": entities
    }


def _extract_company_name(text: str) -> str:
    """Extrai nome da empresa do texto."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        # Primeira linha geralmente é o título/nome
        return lines[0][:50]  # Limita o tamanho
    return "Nome da empresa não identificado"


def _extract_products(text: str) -> List[str]:
    """Extrai produtos/serviços mencionados."""
    products = []
    text_lower = text.lower()
    
    if 'software' in text_lower:
        products.append("Software")
    if 'app' in text_lower or 'aplicativo' in text_lower:
        products.append("Aplicativo")
    if 'api' in text_lower:
        products.append("API")
    if 'ia' in text_lower or 'ai' in text_lower:
        products.append("Soluções de IA")
    if 'automação' in text_lower or 'automation' in text_lower:
        products.append("Automação")
    
    return products if products else ["Produtos não especificados"]


def _extract_pricing(text: str) -> str:
    """Extrai informações de preço."""
    import re
    price_patterns = [
        r'\$\d+',
        r'€\d+',
        r'R\$\s*\d+',
        r'\d+\s*reais',
        r'preço.*?\d+',
        r'price.*?\d+'
    ]
    
    for pattern in price_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            return matches[0]
    
    return "Preços não especificados"


def _extract_tech_stack(text: str) -> List[str]:
    """Extrai tecnologias mencionadas."""
    tech_stack = []
    text_lower = text.lower()
    
    technologies = [
        'python', 'javascript', 'react', 'node', 'vue', 'angular',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes',
        'mysql', 'postgresql', 'mongodb', 'redis',
        'tensorflow', 'pytorch', 'openai', 'gpt'
    ]
    
    for tech in technologies:
        if tech in text_lower:
            tech_stack.append(tech.title())
    
    return tech_stack if tech_stack else ["Stack não especificado"]


def _extract_contacts(text: str) -> List[str]:
    """Extrai informações de contato."""
    import re
    contacts = []
    
    # Busca emails
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    contacts.extend(emails)
    
    # Busca telefones
    phone_pattern = r'(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}'
    phones = re.findall(phone_pattern, text)
    if phones:
        contacts.append("Telefone encontrado")
    
    return contacts if contacts else ["Contatos não fornecidos"]


def _generate_smart_summary(text: str, title: str) -> str:
    """Gera resumo inteligente baseado no conteúdo."""
    # Pega as primeiras 2-3 frases significativas
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    
    if len(sentences) >= 2:
        summary = f"{title}. {sentences[0]}. {sentences[1]}."
    elif len(sentences) == 1:
        summary = f"{title}. {sentences[0]}."
    else:
        summary = f"{title}. {text[:200]}..."
    
    return summary[:400] + ("..." if len(summary) > 400 else "")


def _extract_icp(text: str) -> str:
    """Extrai informações sobre ICP."""
    text_lower = text.lower()
    icp_indicators = []
    
    if any(word in text_lower for word in ['b2b', 'business', 'empresa', 'corporação']):
        icp_indicators.append("Empresas B2B")
    if any(word in text_lower for word in ['startup', 'pequena', 'média']):
        icp_indicators.append("Startups e PMEs")
    if any(word in text_lower for word in ['grande', 'enterprise', 'corporativo']):
        icp_indicators.append("Grandes corporações")
    if any(word in text_lower for word in ['tech', 'tecnologia', 'software']):
        icp_indicators.append("Empresas de tecnologia")
    
    return ", ".join(icp_indicators) if icp_indicators else "Não especificado"


def _extract_products_formatted(text: str) -> str:
    """Extrai produtos formatados."""
    products = _extract_products(text)
    if products and products != ["Produtos não especificados"]:
        return ", ".join(products)
    return "Não especificado"


def _extract_tech_stack_formatted(text: str) -> str:
    """Extrai stack tecnológico formatado."""
    tech_stack = _extract_tech_stack(text)
    if tech_stack and tech_stack != ["Stack não especificado"]:
        return ", ".join(tech_stack)
    return "Não especificado"


def _extract_contacts_formatted(text: str) -> str:
    """Extrai contatos formatados."""
    contacts = _extract_contacts(text)
    if contacts and contacts != ["Contatos não fornecidos"]:
        return ", ".join(contacts)
    return "Não especificado"


def _extract_company_info(text: str) -> str:
    """Extrai informações sobre a empresa."""
    text_lower = text.lower()
    info = []
    
    if any(word in text_lower for word in ['fundada', 'criada', 'estabelecida']):
        info.append("Empresa estabelecida")
    if any(word in text_lower for word in ['startup', 'inovação', 'disruptiva']):
        info.append("Empresa inovadora")
    if any(word in text_lower for word in ['global', 'internacional', 'mundial']):
        info.append("Presença global")
    if any(word in text_lower for word in ['local', 'brasil', 'nacional']):
        info.append("Presença nacional")
    
    return ", ".join(info) if info else "Não especificado"


def _extract_opportunities(text: str) -> str:
    """Extrai oportunidades de vendas."""
    text_lower = text.lower()
    opportunities = []
    
    if any(word in text_lower for word in ['crescimento', 'expansão', 'escalar']):
        opportunities.append("Oportunidade de crescimento")
    if any(word in text_lower for word in ['automação', 'otimização', 'eficiência']):
        opportunities.append("Necessidade de automação")
    if any(word in text_lower for word in ['digital', 'transformação', 'modernização']):
        opportunities.append("Transformação digital")
    if any(word in text_lower for word in ['ia', 'ai', 'inteligência artificial']):
        opportunities.append("Adoção de IA")
    
    return ", ".join(opportunities) if opportunities else "Não especificado"


