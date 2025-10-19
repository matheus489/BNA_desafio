"""
Sistema RAG Hierárquico Revolucionário
Implementa a abordagem de resumos automáticos sem dependência de índices vetoriais
"""
import json
from typing import List, Dict, Any, Tuple
from ..config import settings
import openai


class HierarchicalRAG:
    """
    Sistema RAG baseado em resumos hierárquicos
    Elimina a necessidade de índices vetoriais complexos
    """
    
    def __init__(self):
        self.section_selector_model = "gpt-4o-mini"  # SLLM para seleção
        self.response_generator_model = "gpt-4o-mini"  # SLLM para resposta
        self.evaluator_model = "gpt-4o-mini"  # SLLM para avaliação
    
    async def process_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa uma análise em seções resumidas
        """
        # Quebra o conteúdo em seções lógicas
        sections = await self._split_into_sections(analysis_data)
        
        # Gera resumos automáticos para cada seção
        summarized_sections = []
        for section in sections:
            summary = await self._generate_section_summary(section)
            summarized_sections.append({
                "original": section,
                "summary": summary,
                "metadata": self._extract_section_metadata(section)
            })
        
        return {
            "sections": summarized_sections,
            "total_sections": len(summarized_sections),
            "analysis_id": analysis_data.get("id"),
            "title": analysis_data.get("title")
        }
    
    async def _split_into_sections(self, analysis_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Quebra análise em seções lógicas usando LLM
        """
        content = analysis_data.get("summary", "") + "\n" + analysis_data.get("key_points", "")
        
        split_prompt = f"""
        Analise o seguinte conteúdo de análise empresarial e divida em seções lógicas e coesas.
        Cada seção deve ter um foco específico (ex: produtos, mercado, tecnologia, etc.).
        
        Retorne APENAS um JSON com a seguinte estrutura:
        {{
            "sections": [
                {{
                    "title": "Título da Seção",
                    "content": "Conteúdo da seção",
                    "focus_area": "Área de foco",
                    "importance": "Alta/Média/Baixa"
                }}
            ]
        }}
        
        CONTEÚDO:
        {content[:4000]}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.section_selector_model,
                messages=[{"role": "user", "content": split_prompt}],
                temperature=0.3
            )
            
            result = json.loads(response['choices'][0]['message']['content'])
            return result.get("sections", [])
            
        except Exception as e:
            print(f"Erro ao dividir em seções: {e}")
            return [{"title": "Análise Completa", "content": content, "focus_area": "Geral", "importance": "Alta"}]
    
    async def _generate_section_summary(self, section: Dict[str, Any]) -> str:
        """
        Gera resumo automático de uma seção
        """
        summary_prompt = f"""
        Crie um resumo executivo conciso (máximo 150 palavras) da seguinte seção de análise empresarial.
        Foque nos pontos mais relevantes para vendas B2B.
        
        SEÇÃO: {section.get('title', 'Sem título')}
        CONTEÚDO: {section.get('content', '')}
        
        Retorne apenas o resumo, sem formatação adicional.
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.section_selector_model,
                messages=[{"role": "user", "content": summary_prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            return response['choices'][0]['message']['content'].strip()
            
        except Exception as e:
            print(f"Erro ao gerar resumo da seção: {e}")
            return section.get('content', '')[:150] + "..."
    
    def _extract_section_metadata(self, section: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extrai metadados relevantes da seção
        """
        return {
            "focus_area": section.get("focus_area", "Geral"),
            "importance": section.get("importance", "Média"),
            "word_count": len(section.get("content", "").split()),
            "has_numbers": any(char.isdigit() for char in section.get("content", "")),
            "has_company_names": any(word.istitle() for word in section.get("content", "").split())
        }
    
    async def select_relevant_sections(self, query: str, processed_analyses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        SLLM seleciona seções mais relevantes para a pergunta
        """
        # Prepara contexto para o seletor
        sections_context = []
        for analysis in processed_analyses:
            for section in analysis.get("sections", []):
                sections_context.append({
                    "analysis_id": analysis.get("analysis_id"),
                    "title": analysis.get("title"),
                    "section_title": section.get("original", {}).get("title", ""),
                    "summary": section.get("summary", ""),
                    "metadata": section.get("metadata", {})
                })
        
        selection_prompt = f"""
        Você é um especialista em seleção de conteúdo para RAG.
        
        PERGUNTA DO USUÁRIO: {query}
        
        SEÇÕES DISPONÍVEIS:
        {json.dumps(sections_context, ensure_ascii=False, indent=2)}
        
        Selecione as 3-5 seções mais relevantes para responder à pergunta.
        Retorne APENAS um JSON:
        {{
            "selected_sections": [
                {{
                    "analysis_id": "ID da análise",
                    "section_title": "Título da seção",
                    "relevance_score": 0.0-1.0,
                    "reason": "Por que esta seção é relevante"
                }}
            ]
        }}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.section_selector_model,
                messages=[{"role": "user", "content": selection_prompt}],
                temperature=0.2
            )
            
            result = json.loads(response['choices'][0]['message']['content'])
            return result.get("selected_sections", [])
            
        except Exception as e:
            print(f"Erro na seleção de seções: {e}")
            return sections_context[:3]  # Fallback: primeiras 3 seções
    
    async def generate_response(self, query: str, selected_sections: List[Dict[str, Any]], processed_analyses: List[Dict[str, Any]]) -> str:
        """
        SLLM gera resposta final baseada nas seções selecionadas
        """
        # Monta contexto das seções selecionadas
        context_sections = []
        for selected in selected_sections:
            analysis_id = selected.get("analysis_id")
            section_title = selected.get("section_title")
            
            # Encontra a seção completa
            for analysis in processed_analyses:
                if analysis.get("analysis_id") == analysis_id:
                    for section in analysis.get("sections", []):
                        if section.get("original", {}).get("title") == section_title:
                            context_sections.append({
                                "title": section_title,
                                "content": section.get("original", {}).get("content", ""),
                                "summary": section.get("summary", ""),
                                "analysis_title": analysis.get("title", "")
                            })
                            break
                    break
        
        response_prompt = f"""
        Você é um consultor especializado em vendas B2B.
        
        PERGUNTA: {query}
        
        CONTEXTO RELEVANTE:
        {json.dumps(context_sections, ensure_ascii=False, indent=2)}
        
        Gere uma resposta completa e acionável baseada no contexto fornecido.
        Use formatação markdown para destacar pontos importantes.
        Seja específico e cite as fontes quando relevante.
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.response_generator_model,
                messages=[{"role": "user", "content": response_prompt}],
                temperature=0.7,
                max_tokens=1000
            )
            
            return response['choices'][0]['message']['content']
            
        except Exception as e:
            print(f"Erro ao gerar resposta: {e}")
            return f"Desculpe, ocorreu um erro ao processar sua pergunta. (Erro: {str(e)})"
    
    async def generate_test_questions(self, section: Dict[str, Any]) -> List[str]:
        """
        Gera perguntas automáticas para testar cada seção
        """
        test_prompt = f"""
        Gere 3 perguntas que testariam se esta seção de análise empresarial contém informações relevantes.
        
        SEÇÃO: {section.get('original', {}).get('title', 'Sem título')}
        CONTEÚDO: {section.get('original', {}).get('content', '')[:500]}
        
        Retorne APENAS um JSON:
        {{
            "test_questions": [
                "Pergunta 1",
                "Pergunta 2", 
                "Pergunta 3"
            ]
        }}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.evaluator_model,
                messages=[{"role": "user", "content": test_prompt}],
                temperature=0.5
            )
            
            result = json.loads(response['choices'][0]['message']['content'])
            return result.get("test_questions", [])
            
        except Exception as e:
            print(f"Erro ao gerar perguntas de teste: {e}")
            return ["Esta seção contém informações sobre produtos?", "Quais são os diferenciais mencionados?", "Há dados sobre o mercado?"]


# Instância global
hierarchical_rag = HierarchicalRAG()
