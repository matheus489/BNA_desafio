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
            
            # Limpa o conteúdo e verifica se é válido
            section_content = section_content.strip()
            if section_content and section_content != "Não especificado" and len(section_content) > 3:
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
        if content and content != "Não especificado" and len(content.strip()) > 3:
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
    
    # Palavras-chave para crescimento
    if any(word in text_lower for word in ['crescimento', 'expansão', 'escalar', 'crescer', 'expandir']):
        opportunities.append("Oportunidade de crescimento")
    
    # Palavras-chave para automação
    if any(word in text_lower for word in ['automação', 'otimização', 'eficiência', 'automatizar', 'otimizar']):
        opportunities.append("Necessidade de automação")
    
    # Palavras-chave para transformação digital
    if any(word in text_lower for word in ['digital', 'transformação', 'modernização', 'digitalizar']):
        opportunities.append("Transformação digital")
    
    # Palavras-chave para IA
    if any(word in text_lower for word in ['ia', 'ai', 'inteligência artificial', 'machine learning', 'ml']):
        opportunities.append("Adoção de IA")
    
    # Palavras-chave para inovação
    if any(word in text_lower for word in ['inovação', 'inovador', 'disruptivo', 'tecnologia']):
        opportunities.append("Empresa inovadora")
    
    # Palavras-chave para problemas/desafios
    if any(word in text_lower for word in ['desafio', 'problema', 'dificuldade', 'limitação']):
        opportunities.append("Possíveis pain points identificados")
    
    # Palavras-chave para mercado
    if any(word in text_lower for word in ['mercado', 'competição', 'concorrência', 'diferencial']):
        opportunities.append("Análise de mercado necessária")
    
    # Se não encontrou oportunidades específicas, gera insights baseados no contexto
    if not opportunities:
        # Analisa o tipo de empresa baseado no conteúdo
        if any(word in text_lower for word in ['startup', 'pequena', 'média empresa']):
            opportunities.append("Empresa em crescimento - oportunidades de parceria")
        elif any(word in text_lower for word in ['grande', 'corporação', 'enterprise']):
            opportunities.append("Empresa estabelecida - foco em ROI e eficiência")
        elif any(word in text_lower for word in ['tech', 'tecnologia', 'software']):
            opportunities.append("Empresa de tecnologia - foco em inovação")
        else:
            opportunities.append("Análise de necessidades específicas recomendada")
    
    return ", ".join(opportunities)


async def generate_detailed_report(analysis: Any) -> Dict[str, Any]:
    """
    Gera um relatório detalhado expandido usando IA para uma análise específica.
    
    Args:
        analysis: Objeto PageAnalysis do banco de dados
        
    Returns:
        Dict com seções detalhadas do relatório
    """
    try:
        import openai
        openai.api_key = settings.OPENAI_API_KEY
        
        # Monta o contexto da análise
        context = f"""
        ANÁLISE ORIGINAL:
        URL: {analysis.url}
        Título: {analysis.title or 'N/A'}
        Resumo: {analysis.summary or 'N/A'}
        Pontos-chave: {analysis.key_points or 'N/A'}
        Entidades: {analysis.entities or 'N/A'}
        """
        
        # Prompt para gerar relatório detalhado
        system_prompt = """Você é um consultor sênior de vendas B2B especializado em análise profunda de empresas e geração de insights estratégicos para vendas."""
        
        user_prompt = f"""Com base na análise fornecida abaixo, gere um relatório executivo COMPLETO e DETALHADO que expanda significativamente as informações originais.

ANÁLISE BASE:
{context}

Gere um relatório estruturado com as seguintes seções. IMPORTANTE: Cada seção deve ter CONTEÚDO COMPLETO E DETALHADO (não apenas títulos ou bullets):

=== RESUMO EXECUTIVO EXPANDIDO ===
(Escreva 300-500 palavras com análise profunda da empresa, seu posicionamento no mercado, insights sobre modelo de negócio, estratégia e avaliação de maturidade e potencial de crescimento)

=== ANÁLISE DE MERCADO ===
(Escreva 200-400 palavras sobre segmento de mercado, concorrência, tendências do setor e oportunidades/ameaças identificadas)

=== OPORTUNIDADES DE VENDAS ===
(Escreva 200-400 palavras detalhando pain points específicos, necessidades de tecnologia ou processos, estratégias de abordagem personalizadas e timing ideal para contato)

=== STACK TECNOLÓGICO ===
(Escreva 150-300 palavras com análise detalhada das tecnologias utilizadas, gaps tecnológicos e oportunidades de modernização)

=== ESTRATÉGIA DE ABORDAGEM ===
(Escreva 200-400 palavras identificando personas de decisão, argumentos de valor específicos, objeções comuns e como contorná-las, e próximos passos recomendados)

=== INSIGHTS ADICIONAIS ===
(Escreva 150-300 palavras com observações sobre cultura organizacional, sinais de crescimento ou mudança, e recomendações específicas para o time de vendas)

REGRAS IMPORTANTES:
- Escreva em PORTUGUÊS do Brasil
- Cada seção DEVE ter parágrafos completos e bem desenvolvidos
- Seja específico e baseado em evidências da análise
- Use insights profissionais de vendas B2B
- Foque em informações acionáveis e estratégicas
- Mantenha tom consultivo e profissional
- NÃO use apenas bullets ou listas - desenvolva o conteúdo em texto corrido
- Se alguma informação não estiver disponível, faça inferências razoáveis baseadas no contexto"""

        # Chama GPT-4 para gerar o relatório detalhado
        response = await openai.ChatCompletion.acreate(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4500
        )
        
        # Processa a resposta e extrai as seções
        content = response['choices'][0]['message']['content']
        
        # Log do conteúdo completo para debug
        print(f"=== CONTEÚDO GERADO PELA IA ===")
        print(content[:500])  # Primeiros 500 caracteres
        print(f"... (total: {len(content)} caracteres)")
        
        # Extrai as seções do relatório
        sections = {
            'expanded_summary': extract_section(content, 'RESUMO EXECUTIVO EXPANDIDO'),
            'market_analysis': extract_section(content, 'ANÁLISE DE MERCADO'),
            'sales_opportunities': extract_section(content, 'OPORTUNIDADES DE VENDAS'),
            'tech_stack': extract_section(content, 'STACK TECNOLÓGICO'),
            'approach_strategy': extract_section(content, 'ESTRATÉGIA DE ABORDAGEM'),
            'additional_insights': extract_section(content, 'INSIGHTS ADICIONAIS')
        }
        
        # Log das seções extraídas para debug
        for key, value in sections.items():
            print(f"\n=== {key}: {len(value)} caracteres ===")
            print(value[:150] if value else "VAZIO")
        
        return sections
        
    except Exception as e:
        print(f"Erro ao gerar relatório detalhado: {e}")
        # Retorna conteúdo básico em caso de erro
        return {
            'expanded_summary': f"Relatório detalhado para {analysis.title or 'análise'} - Erro na geração automática.",
            'market_analysis': "Análise de mercado não disponível no momento.",
            'sales_opportunities': "Oportunidades de vendas serão analisadas manualmente.",
            'tech_stack': "Stack tecnológico será avaliado em análise posterior.",
            'approach_strategy': "Estratégia de abordagem será definida pelo time de vendas.",
            'additional_insights': "Insights adicionais serão coletados em próximas interações."
        }


def extract_section(content: str, section_name: str) -> str:
    """
    Extrai uma seção específica do conteúdo gerado.
    
    Args:
        content: Conteúdo completo do relatório
        section_name: Nome da seção a extrair
        
    Returns:
        Conteúdo da seção ou mensagem padrão
    """
    try:
        # Padrões de marcação de seção que vamos procurar
        patterns = [
            f"=== {section_name} ===",
            f"### {section_name}",
            f"## {section_name}",
            f"# {section_name}",
            section_name
        ]
        
        lines = content.split('\n')
        section_start = -1
        section_end = len(lines)
        
        # Procura o início da seção
        for i, line in enumerate(lines):
            line_upper = line.upper().strip()
            for pattern in patterns:
                if pattern.upper() in line_upper:
                    section_start = i + 1  # Começa na linha APÓS o título
                    break
            if section_start != -1:
                break
        
        # Se encontrou o início, procura o fim (próxima seção)
        if section_start != -1:
            for i in range(section_start, len(lines)):
                line = lines[i].strip()
                # Verifica se é início de nova seção
                if line.startswith('===') or line.startswith('###') or line.startswith('##') or line.startswith('#'):
                    # Verifica se não é uma linha dentro de um parágrafo
                    if i > section_start and any(marker in line for marker in ['===', '###', '##']):
                        section_end = i
                        break
            
            # Extrai o conteúdo
            section_lines = lines[section_start:section_end]
            
            # Remove linhas vazias do início e fim
            while section_lines and not section_lines[0].strip():
                section_lines.pop(0)
            while section_lines and not section_lines[-1].strip():
                section_lines.pop()
            
            # Remove instruções entre parênteses (se houver)
            section_content = '\n'.join(section_lines)
            
            # Remove possíveis instruções como "(Escreva 300-500 palavras...)"
            import re
            section_content = re.sub(r'\(Escreva.*?\)', '', section_content, flags=re.IGNORECASE | re.DOTALL)
            section_content = section_content.strip()
            
            if section_content and len(section_content) > 50:  # Pelo menos 50 caracteres
                return section_content
            else:
                return f"Conteúdo da seção {section_name} não foi gerado adequadamente. Tente gerar o relatório novamente."
        
        return f"Seção {section_name} não encontrada no relatório gerado."
        
    except Exception as e:
        print(f"Erro ao extrair seção {section_name}: {e}")
        import traceback
        traceback.print_exc()
        return f"Erro ao processar seção {section_name}: {str(e)}"


