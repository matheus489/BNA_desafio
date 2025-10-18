"""
Serviço de Comparação entre Empresas.

Compara múltiplas análises lado a lado usando IA para gerar insights
e recomendações sobre qual empresa abordar primeiro.
"""

from typing import List, Dict, Any
import json
from ..config import settings


async def compare_companies(analyses: List[Any]) -> Dict[str, Any]:
    """
    Compara múltiplas empresas e gera análise comparativa com IA.
    
    Args:
        analyses: Lista de objetos PageAnalysis do banco de dados (2-5 empresas)
        
    Returns:
        Dict com comparação estruturada e recomendações
    """
    if len(analyses) < 2:
        raise ValueError("É necessário selecionar pelo menos 2 empresas para comparar")
    
    if len(analyses) > 5:
        raise ValueError("Máximo de 5 empresas podem ser comparadas por vez")
    
    try:
        # Monta contexto de cada empresa
        companies_context = []
        for i, analysis in enumerate(analyses, 1):
            entities = json.loads(analysis.entities) if analysis.entities else {}
            key_points = json.loads(analysis.key_points) if analysis.key_points else []
            
            context = f"""
EMPRESA {i}: {analysis.title or 'Sem título'}
URL: {analysis.url}

RESUMO:
{analysis.summary or 'Não disponível'}

INFORMAÇÕES-CHAVE:
{_format_key_points(key_points)}

ENTIDADES:
- Produtos: {', '.join(entities.get('products', ['N/A'])) if isinstance(entities.get('products'), list) else entities.get('products', 'N/A')}
- Pricing: {entities.get('pricing', 'N/A')}
- Stack: {', '.join(entities.get('tech_stack', ['N/A'])) if isinstance(entities.get('tech_stack'), list) else entities.get('tech_stack', 'N/A')}
- Contatos: {', '.join(entities.get('contacts', ['N/A'])) if isinstance(entities.get('contacts'), list) else entities.get('contacts', 'N/A')}
"""
            companies_context.append(context)
        
        # Usa IA para gerar comparação
        comparison = await _generate_ai_comparison(companies_context, analyses)
        
        return comparison
        
    except Exception as e:
        print(f"Erro ao comparar empresas: {e}")
        # Fallback: comparação básica sem IA
        return _generate_basic_comparison(analyses)


async def _generate_ai_comparison(companies_context: List[str], analyses: List[Any]) -> Dict[str, Any]:
    """Gera comparação detalhada usando IA."""
    try:
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        
        # Monta prompt
        context_text = "\n\n".join(companies_context)
        company_names = [f"Empresa {i+1}: {a.title or a.url}" for i, a in enumerate(analyses)]
        
        prompt = f"""Você é um consultor sênior de vendas B2B. Analise e compare as empresas abaixo:

{context_text}

Gere uma análise comparativa ESTRUTURADA com as seguintes seções:

=== RESUMO EXECUTIVO ===
(Parágrafo de 3-4 frases comparando as empresas em alto nível)

=== COMPARAÇÃO DE STACK TECNOLÓGICO ===
Para cada empresa:
- Empresa 1: [descrição do stack]
- Empresa 2: [descrição do stack]
- Empresa 3: [descrição do stack] (se houver)

Análise: [Qual tem stack mais moderno/compatível?]

=== COMPARAÇÃO DE PRICING ===
Para cada empresa:
- Empresa 1: [modelo de pricing]
- Empresa 2: [modelo de pricing]
- Empresa 3: [modelo de pricing] (se houver)

Análise: [Qual tem melhor potencial de budget?]

=== COMPARAÇÃO DE ICP FIT ===
Para cada empresa:
- Empresa 1: [fit com ICP ideal]
- Empresa 2: [fit com ICP ideal]
- Empresa 3: [fit com ICP ideal] (se houver)

Análise: [Qual tem melhor fit?]

=== OPORTUNIDADES ÚNICAS ===
Para cada empresa, liste 2-3 oportunidades específicas:
- Empresa 1: [oportunidades]
- Empresa 2: [oportunidades]
- Empresa 3: [oportunidades] (se houver)

=== RANKING RECOMENDADO ===
Ordene as empresas por prioridade de abordagem (1 = mais prioritária):

1. [Nome da Empresa] - [Razão principal]
2. [Nome da Empresa] - [Razão principal]
3. [Nome da Empresa] - [Razão principal] (se houver)

=== ESTRATÉGIA DE ABORDAGEM ===
Para a empresa #1 (mais prioritária):
[Estratégia específica de 3-4 frases]

REGRAS:
- Seja específico e baseado em dados
- Use insights profissionais de vendas B2B
- Seja consultivo e estratégico
- Foque em diferenciais de cada empresa"""

        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Você é um especialista em análise comparativa para vendas B2B."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        content = response['choices'][0]['message']['content']
        
        # Parseia resposta
        parsed = _parse_comparison_response(content, analyses)
        
        return parsed
        
    except Exception as e:
        print(f"Erro ao gerar comparação com IA: {e}")
        import traceback
        traceback.print_exc()
        return _generate_basic_comparison(analyses)


def _parse_comparison_response(content: str, analyses: List[Any]) -> Dict[str, Any]:
    """Parseia resposta da IA em estrutura organizada."""
    
    sections = {
        "executive_summary": _extract_section_content(content, "RESUMO EXECUTIVO"),
        "tech_stack_comparison": _extract_section_content(content, "COMPARAÇÃO DE STACK TECNOLÓGICO"),
        "pricing_comparison": _extract_section_content(content, "COMPARAÇÃO DE PRICING"),
        "icp_fit_comparison": _extract_section_content(content, "COMPARAÇÃO DE ICP FIT"),
        "unique_opportunities": _extract_section_content(content, "OPORTUNIDADES ÚNICAS"),
        "recommended_ranking": _extract_ranking(content, analyses),
        "approach_strategy": _extract_section_content(content, "ESTRATÉGIA DE ABORDAGEM"),
    }
    
    # Adiciona informações básicas das empresas
    sections["companies"] = [
        {
            "id": analysis.id,
            "title": analysis.title or "Sem título",
            "url": analysis.url,
            "created_at": analysis.created_at.isoformat() if analysis.created_at else None
        }
        for analysis in analyses
    ]
    
    return sections


def _extract_section_content(content: str, section_name: str) -> str:
    """Extrai conteúdo de uma seção específica."""
    lines = content.split('\n')
    section_start = -1
    section_end = len(lines)
    
    # Procura início da seção
    for i, line in enumerate(lines):
        if section_name.upper() in line.upper().strip('= '):
            section_start = i + 1
            break
    
    if section_start == -1:
        return "Seção não encontrada"
    
    # Procura fim (próxima seção)
    for i in range(section_start, len(lines)):
        line = lines[i].strip()
        if line.startswith('===') and i > section_start:
            section_end = i
            break
    
    # Extrai e limpa conteúdo
    section_lines = lines[section_start:section_end]
    section_text = '\n'.join(line for line in section_lines if line.strip())
    
    return section_text.strip() or "Conteúdo não disponível"


def _extract_ranking(content: str, analyses: List[Any]) -> List[Dict[str, Any]]:
    """Extrai e estrutura o ranking recomendado."""
    ranking_section = _extract_section_content(content, "RANKING RECOMENDADO")
    
    ranking = []
    lines = ranking_section.split('\n')
    
    for line in lines:
        line = line.strip()
        # Procura por linhas que começam com número
        if line and line[0].isdigit():
            # Remove numeração
            parts = line.split('.', 1)
            if len(parts) > 1:
                rest = parts[1].strip()
                # Tenta separar nome e razão
                if ' - ' in rest:
                    name, reason = rest.split(' - ', 1)
                    ranking.append({
                        "position": len(ranking) + 1,
                        "company": name.strip(),
                        "reason": reason.strip()
                    })
                else:
                    ranking.append({
                        "position": len(ranking) + 1,
                        "company": rest,
                        "reason": "Alta prioridade"
                    })
    
    # Se não encontrou ranking estruturado, cria um básico
    if not ranking:
        for i, analysis in enumerate(analyses):
            ranking.append({
                "position": i + 1,
                "company": analysis.title or f"Empresa {i+1}",
                "reason": "Análise manual recomendada"
            })
    
    return ranking


def _format_key_points(key_points: List[str]) -> str:
    """Formata pontos-chave para exibição."""
    if not key_points:
        return "Não disponível"
    
    # Limita a 5 pontos principais
    formatted = []
    for i, point in enumerate(key_points[:5], 1):
        formatted.append(f"  {i}. {point}")
    
    return '\n'.join(formatted)


def _generate_basic_comparison(analyses: List[Any]) -> Dict[str, Any]:
    """Gera comparação básica sem IA (fallback)."""
    
    companies = []
    tech_comparison = []
    pricing_comparison = []
    
    for i, analysis in enumerate(analyses, 1):
        entities = json.loads(analysis.entities) if analysis.entities else {}
        
        companies.append({
            "id": analysis.id,
            "title": analysis.title or f"Empresa {i}",
            "url": analysis.url,
            "created_at": analysis.created_at.isoformat() if analysis.created_at else None
        })
        
        # Stack
        tech_stack = entities.get('tech_stack', [])
        if isinstance(tech_stack, str):
            tech_stack = [tech_stack]
        tech_comparison.append(f"Empresa {i}: {', '.join(tech_stack) if tech_stack else 'Não especificado'}")
        
        # Pricing
        pricing = entities.get('pricing', 'Não especificado')
        pricing_comparison.append(f"Empresa {i}: {pricing}")
    
    return {
        "executive_summary": f"Comparação entre {len(analyses)} empresas analisadas. Revise os detalhes abaixo para tomar decisão estratégica.",
        "tech_stack_comparison": '\n'.join(tech_comparison),
        "pricing_comparison": '\n'.join(pricing_comparison),
        "icp_fit_comparison": "Análise manual recomendada para avaliar fit com ICP ideal.",
        "unique_opportunities": "Revise cada análise individual para identificar oportunidades específicas.",
        "recommended_ranking": [
            {
                "position": i + 1,
                "company": analysis.title or f"Empresa {i+1}",
                "reason": "Análise detalhada necessária"
            }
            for i, analysis in enumerate(analyses)
        ],
        "approach_strategy": "Priorize as empresas com stack mais compatível e sinais claros de capacidade de investimento.",
        "companies": companies
    }

