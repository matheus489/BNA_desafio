"""
Serviço de Simulador de Objeções
Gera objeções realistas e sugestões de respostas para treinamento de vendas
"""

from typing import List, Dict, Any, Optional
import json
from ..config import settings


async def generate_objections(analysis: Any, difficulty: str = "medium") -> Dict[str, Any]:
    """
    Gera objeções de vendas baseadas na análise da empresa.
    
    Args:
        analysis: Objeto PageAnalysis do banco de dados
        difficulty: Nível de dificuldade (easy, medium, hard)
        
    Returns:
        Dict com objeções geradas e contexto
    """
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "openai":
        try:
            import openai
            openai.api_key = settings.OPENAI_API_KEY
            
            # Monta contexto da empresa
            context = _build_company_context(analysis)
            
            # Gera objeções com IA
            system_prompt = """Você é um comprador B2B experiente e cético. Seu papel é fazer objeções realistas e desafiadoras durante simulações de vendas para treinar vendedores."""
            
            user_prompt = f"""Com base nas informações da empresa abaixo, gere 5 objeções de vendas realistas e desafiadoras.

INFORMAÇÕES DA EMPRESA:
{context}

NÍVEL DE DIFICULDADE: {difficulty}
- easy: Objeções comuns e diretas
- medium: Objeções mais elaboradas e específicas  
- hard: Objeções complexas que exigem conhecimento profundo

Para cada objeção, forneça:
1. A objeção (primeira pessoa, como se fosse o comprador falando)
2. O tipo de objeção (preço, timing, concorrência, necessidade, autoridade, confiança)
3. Uma dica de como responder
4. A resposta sugerida completa

Formato JSON:
{{
  "objections": [
    {{
      "id": 1,
      "objection": "A objeção em primeira pessoa...",
      "type": "tipo",
      "difficulty": "{difficulty}",
      "hint": "Dica curta de abordagem...",
      "suggested_response": "Resposta completa e estruturada...",
      "context": "Por que esta objeção é relevante para esta empresa..."
    }}
  ],
  "company_context": "Resumo do que o vendedor precisa saber sobre esta empresa...",
  "overall_strategy": "Estratégia geral para abordar esta empresa..."
}}

IMPORTANTE: 
- Seja específico baseado nas informações reais da empresa
- Varie os tipos de objeções
- As objeções devem soar naturais e realistas
- Respostas devem ser consultivas, não agressivas
- Use dados e evidências quando possível"""

            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            # Parse resposta
            content = response['choices'][0]['message']['content']
            
            # Tenta extrair JSON
            try:
                # Remove markdown se houver
                if '```json' in content:
                    content = content.split('```json')[1].split('```')[0].strip()
                elif '```' in content:
                    content = content.split('```')[1].split('```')[0].strip()
                
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                # Se falhar, cria estrutura manualmente
                return _parse_objections_from_text(content, difficulty)
                
        except Exception as e:
            print(f"Erro ao gerar objeções com IA: {e}")
            # Fallback para objeções mock
            return _generate_mock_objections(analysis, difficulty)
    
    # Fallback se não houver provider
    return _generate_mock_objections(analysis, difficulty)


def _build_company_context(analysis: Any) -> str:
    """Monta contexto da empresa para a IA."""
    context = f"""
URL: {analysis.url}
Título: {analysis.title or 'N/A'}

RESUMO:
{analysis.summary[:1000] if analysis.summary else 'N/A'}

PONTOS-CHAVE:
{json.dumps(analysis.key_points, ensure_ascii=False) if analysis.key_points else 'N/A'}

ENTIDADES:
{json.dumps(analysis.entities, ensure_ascii=False) if analysis.entities else 'N/A'}
"""
    return context.strip()


def _parse_objections_from_text(text: str, difficulty: str) -> Dict[str, Any]:
    """Tenta extrair objeções de texto não estruturado."""
    # Implementação simplificada - tenta encontrar padrões
    objections = []
    
    lines = text.split('\n')
    current_objection = None
    
    for line in lines:
        line = line.strip()
        if line.startswith(('1.', '2.', '3.', '4.', '5.', '-')) and len(line) > 20:
            if current_objection:
                objections.append(current_objection)
            current_objection = {
                "id": len(objections) + 1,
                "objection": line.lstrip('1234567890.- '),
                "type": "geral",
                "difficulty": difficulty,
                "hint": "Aborde com empatia e dados concretos",
                "suggested_response": "Resposta será gerada no treinamento",
                "context": "Objeção relevante para este caso"
            }
    
    if current_objection:
        objections.append(current_objection)
    
    return {
        "objections": objections if objections else _get_default_objections(difficulty),
        "company_context": "Contexto da empresa analisada",
        "overall_strategy": "Abordagem consultiva focada em valor"
    }


def _generate_mock_objections(analysis: Any, difficulty: str) -> Dict[str, Any]:
    """Gera objeções mock inteligentes baseadas na análise."""
    
    # Extrai informações da análise
    company_name = "a empresa"
    if analysis.entities:
        try:
            entities = json.loads(analysis.entities) if isinstance(analysis.entities, str) else analysis.entities
            company_name = entities.get('company_name', 'a empresa')
        except:
            pass
    
    objections_by_difficulty = {
        "easy": [
            {
                "id": 1,
                "objection": "O preço está muito alto para o nosso orçamento atual.",
                "type": "preço",
                "difficulty": "easy",
                "hint": "Foque no ROI e valor agregado, não no preço absoluto",
                "suggested_response": f"Entendo sua preocupação com investimento. Vamos olhar juntos o retorno esperado? Empresas similares a {company_name} geralmente recuperam o investimento em 3-6 meses através de ganhos de eficiência. Posso mostrar alguns casos práticos?",
                "context": "Objeção clássica de preço - muito comum em primeiras conversas"
            },
            {
                "id": 2,
                "objection": "Já temos uma solução similar implementada.",
                "type": "concorrência",
                "difficulty": "easy",
                "hint": "Demonstre diferenciais únicos e gaps da solução atual",
                "suggested_response": f"Ótimo que já estejam investindo nessa área! Posso perguntar - vocês estão 100% satisfeitos com os resultados atuais? Muitos clientes que vieram de outras soluções destacam principalmente [diferencial específico]. Vale uma conversa rápida para ver se faz sentido?",
                "context": "Cliente já usa concorrente - precisa mostrar valor incremental"
            },
            {
                "id": 3,
                "objection": "Não é prioridade agora, talvez no próximo trimestre.",
                "type": "timing",
                "difficulty": "easy",
                "hint": "Crie urgência com base em custos de inação",
                "suggested_response": f"Entendo perfeitamente as prioridades. Só por curiosidade - quanto {company_name} estima perder mensalmente por não ter essa otimização? Às vezes o custo de esperar é maior que pensamos. Que tal uma análise rápida sem compromisso?",
                "context": "Procrastinação - precisa criar senso de urgência real"
            },
            {
                "id": 4,
                "objection": "Preciso conversar com o time antes de decidir.",
                "type": "autoridade",
                "difficulty": "easy",
                "hint": "Facilite o processo de decisão e envolva stakeholders",
                "suggested_response": f"Claro, decisões assim devem ser tomadas em conjunto. Posso ajudar preparando um resumo executivo para você compartilhar? Ou prefere que eu participe de uma reunião rápida com o time para esclarecer dúvidas técnicas?",
                "context": "Falta autoridade de decisão - precisa facilitar processo interno"
            },
            {
                "id": 5,
                "objection": "Não tenho certeza se nossa equipe vai adotar isso.",
                "type": "confiança",
                "difficulty": "easy",
                "hint": "Destaque facilidade de implementação e suporte",
                "suggested_response": f"Essa é uma preocupação muito válida! Nossa taxa de adoção é de 95% justamente porque focamos em UX e treinamento. Podemos começar com um piloto em um time menor de {company_name}? Assim vocês validam internamente sem grandes riscos.",
                "context": "Medo de resistência interna - precisa garantir suporte e facilidade"
            }
        ],
        "medium": [
            {
                "id": 1,
                "objection": f"Vi que vocês trabalham principalmente com empresas maiores. {company_name} realmente se encaixa no perfil?",
                "type": "adequação",
                "difficulty": "medium",
                "hint": "Mostre flexibilidade e casos similares",
                "suggested_response": f"Excelente observação! De fato, temos clientes enterprise, mas também temos um segmento forte de empresas em crescimento como {company_name}. Na verdade, empresas do seu porte são estratégicas porque conseguem implementar mais rápido. Posso compartilhar 3 casos de empresas similares que tiveram ótimos resultados?",
                "context": "Dúvida sobre fit - precisa demonstrar flexibilidade e casos relevantes"
            },
            {
                "id": 2,
                "objection": "Tivemos uma experiência ruim com um fornecedor similar há um ano. Como garantir que não vai acontecer de novo?",
                "type": "confiança",
                "difficulty": "medium",
                "hint": "Empatia + diferenciação + garantias concretas",
                "suggested_response": f"Lamento pela experiência anterior - isso realmente marca. Pode me contar o que deu errado? [ouvir ativamente]. Entendo. Nosso diferencial é [X, Y, Z específicos]. Além disso, oferecemos [garantias concretas]. Que tal estruturarmos um piloto com métricas claras e cláusulas de saída flexíveis?",
                "context": "Trauma com fornecedor anterior - precisa reconstruir confiança"
            },
            {
                "id": 3,
                "objection": "Nossa área de TI está sobrecarregada. Não temos banda para mais um projeto de integração agora.",
                "type": "recursos",
                "difficulty": "medium",
                "hint": "Minimize fricção de implementação e ofereça suporte",
                "suggested_response": f"Justamente por isso desenhamos nossa solução para ser plug-and-play. A integração média leva 2 dias com mínimo envolvimento de TI - fazemos 90% do trabalho pesado. Inclusive, podemos agendar para um momento mais tranquilo. Quando o time de TI costuma ter mais disponibilidade?",
                "context": "Gargalo de recursos internos - precisa minimizar atrito"
            },
            {
                "id": 4,
                "objection": "O concorrente X oferece funcionalidade Y que vocês não têm. Como compensam isso?",
                "type": "concorrência",
                "difficulty": "medium",
                "hint": "Reconheça, redirecione para seus diferenciais",
                "suggested_response": f"Verdade, o concorrente X tem a funcionalidade Y. Tomamos a decisão consciente de não desenvolver porque [razão estratégica]. Em vez disso, investimos pesado em [diferenciais fortes]. Na prática, nossos clientes valorizam mais [benefício real] do que Y. Mas entendo sua necessidade - Y é realmente crítico para {company_name} ou há flexibilidade?",
                "context": "Comparação específica com concorrente - precisa reposicionar valor"
            },
            {
                "id": 5,
                "objection": "Nosso CEO quer construir isso internamente em vez de comprar. Como você responderia a isso?",
                "type": "build_vs_buy",
                "difficulty": "medium",
                "hint": "Análise de custo total de propriedade e time-to-market",
                "suggested_response": f"É uma abordagem válida dependendo do core business. Posso perguntar - quanto tempo e quantos devs vocês estimam dedicar? [ouvir]. Nossos clientes que tentaram build-it-yourself reportaram custo 3-5x maior e 12+ meses de delay. Além disso, {company_name} quer investir recursos em [core business deles] ou em [nossa solução]? Podemos fazer um comparativo rápido de TCO?",
                "context": "Decisão build vs buy - precisa mostrar custo oculto de desenvolver"
            }
        ],
        "hard": [
            {
                "id": 1,
                "objection": f"Analisamos o ROI e pelos nossos números, levaria 18 meses para {company_name} ter retorno. Isso não faz sentido financeiramente.",
                "type": "roi",
                "difficulty": "hard",
                "hint": "Questione premissas, mostre valor oculto e benefícios indiretos",
                "suggested_response": f"Aprecio vocês terem feito a análise! Posso entender as premissas que usaram? [revisar juntos]. Vejo que consideraram [X e Y], mas não incluíram [benefícios indiretos importantes]. Nossos clientes também subestimaram inicialmente. Podemos refazer o cálculo incluindo [redução de churn, aumento de produtividade, economia de escala]? Clientes similares chegaram a ROI de 4-6 meses.",
                "context": "Objeção quantitativa com análise - precisa desafiar premissas construtivamente"
            },
            {
                "id": 2,
                "objection": "Tentamos algo parecido há 2 anos, gastamos 200k e não funcionou. Por que seria diferente agora?",
                "type": "fracasso_anterior",
                "difficulty": "hard",
                "hint": "Investigar profundamente o fracasso, mostrar lições aprendidas",
                "suggested_response": f"200k é um investimento significativo - deve ter sido frustrante. Preciso entender: o problema foi a solução, a implementação ou o timing? [investigar fundo]. O que mudou desde então em {company_name}? [ouvir]. Interessante. Com base no que você contou, o erro foi [análise]. Hoje, com [novas condições], o cenário é diferente porque [razões]. Mas entendo a cautela - que tal estruturarmos com marcos de validação progressivos?",
                "context": "Histórico de fracasso caro - precisa reconstruir confiança completamente"
            },
            {
                "id": 3,
                "objection": "Li reviews negativos online mencionando problemas com [aspecto específico]. Isso me preocupa bastante.",
                "type": "reputação",
                "difficulty": "hard",
                "hint": "Transparência total, contexto e melhorias implementadas",
                "suggested_response": f"Agradeço ter levantado isso - é importante. Essas reviews foram de [contexto específico] em [período]. Foi um aprendizado doloroso. Desde então: 1) Mudamos [processo], 2) Investimos em [melhoria], 3) Implementamos [garantia]. Posso conectar você com clientes que tiveram experiência similar e hoje são nossos maiores defensores? Também oferecemos [garantia específica] para mitigar esse risco.",
                "context": "Reputação manchada - precisa de transparência e evidências de mudança"
            },
            {
                "id": 4,
                "objection": f"Nosso board aprovou budget para o concorrente X. Precisaria de um business case muito forte para reverter essa decisão.",
                "type": "deal_avançado_concorrente",
                "difficulty": "hard",
                "hint": "Needs diferenciação massiva ou admitir derrota graciosamente",
                "suggested_response": f"Entendo - decisão de board é séria. Não quero te colocar em posição difícil politicamente. Mas me permite fazer duas perguntas: 1) A decisão já foi oficializada ou ainda tem janela? 2) Se eu trouxer evidências de [diferencial crítico] que impacta diretamente [KPI importante para eles], vale a pena apresentar? Caso não, respeito totalmente. Podemos manter contato para revisão no futuro?",
                "context": "Deal quase perdido - última tentativa ou plant seeds para futuro"
            },
            {
                "id": 5,
                "objection": f"Somos uma empresa de [setor específico]. Suas cases são todos de [outros setores]. Como adaptar para nossa realidade específica com [requisitos únicos]?",
                "type": "vertical_específico",
                "difficulty": "hard",
                "hint": "Demonstre profundidade técnica e flexibilidade da solução",
                "suggested_response": f"Questão pertinente - verticalização importa. Embora a maioria dos cases sejam de [outros setores], a arquitetura da solução é [flexível/modular]. Os requisitos específicos de {company_name} como [requisito 1] e [requisito 2] são endereçáveis via [abordagem técnica]. Na verdade, temos um cliente em [setor próximo] com desafios similares. Posso arranjar uma conversa com o tech lead deles? Ou prefere uma POC customizada?",
                "context": "Necessidade de customização vertical - precisa provar viabilidade técnica"
            }
        ]
    }
    
    objections = objections_by_difficulty.get(difficulty, objections_by_difficulty["medium"])
    
    return {
        "objections": objections,
        "company_context": f"Empresa analisada: {company_name}. Use informações específicas da análise para personalizar suas respostas.",
        "overall_strategy": "Abordagem consultiva: ouça ativamente, demonstre empatia, use dados concretos, foque em valor não em features, construa confiança progressivamente."
    }


def _get_default_objections(difficulty: str) -> List[Dict[str, Any]]:
    """Retorna objeções padrão genéricas."""
    return [
        {
            "id": 1,
            "objection": "O preço está muito alto.",
            "type": "preço",
            "difficulty": difficulty,
            "hint": "Foque em valor, não em preço",
            "suggested_response": "Entendo sua preocupação. Vamos analisar o ROI juntos?",
            "context": "Objeção comum de preço"
        }
    ]


async def evaluate_response(
    objection: str,
    user_response: str,
    suggested_response: str,
    company_context: str
) -> Dict[str, Any]:
    """
    Avalia a resposta do usuário a uma objeção.
    
    Args:
        objection: A objeção apresentada
        user_response: Resposta dada pelo usuário
        suggested_response: Resposta sugerida pelo sistema
        company_context: Contexto da empresa
        
    Returns:
        Dict com avaliação e feedback
    """
    provider = settings.LLM_PROVIDER.lower()
    
    if provider == "openai":
        try:
            import openai
            openai.api_key = settings.OPENAI_API_KEY
            
            system_prompt = """Você é um mentor de vendas experiente avaliando respostas de vendedores em treinamento."""
            
            user_prompt = f"""Avalie a resposta do vendedor à objeção abaixo:

CONTEXTO DA EMPRESA:
{company_context}

OBJEÇÃO DO CLIENTE:
"{objection}"

RESPOSTA DO VENDEDOR:
"{user_response}"

RESPOSTA SUGERIDA (referência):
"{suggested_response}"

Forneça uma avaliação estruturada em JSON:
{{
  "score": 85,  // 0-100
  "grade": "B+",  // A+, A, B+, B, C+, C, D, F
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "weaknesses": ["ponto fraco 1", "ponto fraco 2"],
  "improvements": ["sugestão específica 1", "sugestão específica 2"],
  "tone_analysis": "análise do tom usado (empático, defensivo, consultivo, etc)",
  "overall_feedback": "feedback geral em 2-3 frases"
}}

CRITÉRIOS:
- Empatia e escuta ativa (25%)
- Uso de dados e evidências (25%)
- Estrutura da resposta (20%)
- Tom consultivo vs vendedor (15%)
- Personalização ao contexto (15%)"""

            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response['choices'][0]['message']['content']
            
            # Parse JSON
            try:
                if '```json' in content:
                    content = content.split('```json')[1].split('```')[0].strip()
                elif '```' in content:
                    content = content.split('```')[1].split('```')[0].strip()
                
                return json.loads(content)
            except json.JSONDecodeError:
                return _generate_mock_evaluation(user_response, suggested_response)
                
        except Exception as e:
            print(f"Erro ao avaliar resposta: {e}")
            return _generate_mock_evaluation(user_response, suggested_response)
    
    return _generate_mock_evaluation(user_response, suggested_response)


def _generate_mock_evaluation(user_response: str, suggested_response: str) -> Dict[str, Any]:
    """Gera avaliação mock básica."""
    
    # Análise simplificada
    score = 70
    grade = "B"
    strengths = []
    weaknesses = []
    
    # Verifica comprimento
    if len(user_response) > 100:
        strengths.append("Resposta bem desenvolvida")
        score += 5
    else:
        weaknesses.append("Resposta muito curta - desenvolva mais")
        score -= 10
    
    # Verifica palavras-chave positivas
    positive_words = ['entendo', 'compreendo', 'juntos', 'vamos', 'podemos', 'exemplo', 'caso']
    if any(word in user_response.lower() for word in positive_words):
        strengths.append("Bom uso de linguagem consultiva")
        score += 10
    
    # Verifica tom defensivo
    defensive_words = ['mas', 'porém', 'errado', 'não']
    if user_response.lower().count('não') > 2:
        weaknesses.append("Tom um pouco defensivo - tente reformular positivamente")
        score -= 5
    
    # Determina grade
    if score >= 90:
        grade = "A+"
    elif score >= 85:
        grade = "A"
    elif score >= 80:
        grade = "B+"
    elif score >= 70:
        grade = "B"
    elif score >= 60:
        grade = "C+"
    else:
        grade = "C"
    
    return {
        "score": min(100, max(0, score)),
        "grade": grade,
        "strengths": strengths if strengths else ["Resposta presente e estruturada"],
        "weaknesses": weaknesses if weaknesses else ["Poderia incluir mais dados concretos"],
        "improvements": [
            "Use mais perguntas abertas para engajar o cliente",
            "Inclua exemplos ou casos específicos",
            "Termine com próximo passo claro"
        ],
        "tone_analysis": "Tom profissional e adequado",
        "overall_feedback": "Boa resposta! Continue praticando para refinar sua abordagem e incluir mais elementos consultivos."
    }

