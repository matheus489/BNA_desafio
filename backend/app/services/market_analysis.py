"""
Serviço de análise de mercado e tendências
"""
from typing import Dict, List, Any
import json
from ..config import settings


async def analyze_market_trends(company_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analisa tendências de mercado baseadas nos dados da empresa
    """
    try:
        import openai  # type: ignore
        
        market_prompt = f"""
        Com base nos dados da empresa, analise tendências de mercado e oportunidades:
        
        DADOS DA EMPRESA:
        {json.dumps(company_data, indent=2)}
        
        Forneça análise em formato JSON:
        {{
            "market_trends": {{
                "industry_growth": "[Taxa de crescimento do setor]",
                "key_trends": ["[tendência1]", "[tendência2]", "[tendência3]"],
                "market_drivers": ["[driver1]", "[driver2]"],
                "regulatory_impact": "[Impacto regulatório]"
            }},
            "competitive_analysis": {{
                "market_position": "[Posição no mercado]",
                "competitive_advantages": ["[vantagem1]", "[vantagem2]"],
                "threats": ["[ameaça1]", "[ameaça2]"],
                "opportunities": ["[oportunidade1]", "[oportunidade2]"]
            }},
            "sales_opportunities": {{
                "high_value_prospects": ["[tipo1]", "[tipo2]"],
                "upsell_potential": "[Potencial de upsell]",
                "cross_sell_opportunities": ["[oportunidade1]", "[oportunidade2]"],
                "partnership_potential": "[Potencial de parceria]"
            }},
            "risk_factors": {{
                "market_risks": ["[risco1]", "[risco2]"],
                "technology_risks": ["[risco1]", "[risco2]"],
                "business_risks": ["[risco1]", "[risco2]"],
                "mitigation_strategies": ["[estratégia1]", "[estratégia2]"]
            }}
        }}
        """
        
        resp = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": market_prompt}],
            temperature=0.2,
        )
        
        analysis_text = resp["choices"][0]["message"]["content"]
        
        # Extrai JSON
        import re
        json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
            
    except Exception as e:
        print(f"Erro na análise de mercado: {e}")
    
    return {
        "market_trends": {"industry_growth": "Não identificado"},
        "competitive_analysis": {"market_position": "Não identificado"},
        "sales_opportunities": {"high_value_prospects": []},
        "risk_factors": {"market_risks": []}
    }


async def generate_sales_strategy(company_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Gera estratégia de vendas personalizada para a empresa
    """
    try:
        import openai  # type: ignore
        
        strategy_prompt = f"""
        Com base nos dados da empresa, crie uma estratégia de vendas personalizada:
        
        DADOS DA EMPRESA:
        {json.dumps(company_data, indent=2)}
        
        Forneça estratégia em formato JSON:
        {{
            "approach_strategy": {{
                "primary_approach": "[Abordagem principal recomendada]",
                "messaging_framework": "[Framework de mensagens]",
                "value_proposition": "[Proposta de valor personalizada]",
                "objection_handling": ["[objeção1]", "[objeção2]"]
            }},
            "stakeholder_mapping": {{
                "decision_makers": ["[cargo1]", "[cargo2]"],
                "influencers": ["[cargo1]", "[cargo2]"],
                "champions": ["[cargo1]", "[cargo2]"],
                "gatekeepers": ["[cargo1]", "[cargo2]"]
            }},
            "sales_process": {{
                "discovery_questions": ["[pergunta1]", "[pergunta2]"],
                "demo_focus": "[Foco da demonstração]",
                "proof_points": ["[prova1]", "[prova2]"],
                "next_steps": ["[passo1]", "[passo2]"]
            }},
            "success_metrics": {{
                "kpis": ["[KPI1]", "[KPI2]"],
                "success_indicators": ["[indicador1]", "[indicador2]"],
                "timeline": "[Timeline estimado]",
                "budget_indicators": ["[indicador1]", "[indicador2]"]
            }}
        }}
        """
        
        resp = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": strategy_prompt}],
            temperature=0.3,
        )
        
        strategy_text = resp["choices"][0]["message"]["content"]
        
        # Extrai JSON
        import re
        json_match = re.search(r'\{.*\}', strategy_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
            
    except Exception as e:
        print(f"Erro na geração de estratégia: {e}")
    
    return {
        "approach_strategy": {"primary_approach": "Consultivo"},
        "stakeholder_mapping": {"decision_makers": []},
        "sales_process": {"discovery_questions": []},
        "success_metrics": {"kpis": []}
    }
