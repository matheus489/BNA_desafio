"""
Sistema de Avaliação (Evals) para RAG
Implementa framework de avaliação contínua baseado em Hamel Husain e Shreya Shankar
"""
import json
from typing import List, Dict, Any, Tuple
from datetime import datetime
from ..config import settings
import openai


class RAGEvaluator:
    """
    Sistema de avaliação para RAG
    Avalia separadamente retriever e generator
    """
    
    def __init__(self):
        self.evaluator_model = "gpt-4o-mini"
    
    async def evaluate_retriever(self, query: str, selected_sections: List[Dict[str, Any]], ground_truth: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Avalia a qualidade do retriever (seleção de seções)
        """
        evaluation_prompt = f"""
        Você é um especialista em avaliação de sistemas RAG.
        
        PERGUNTA: {query}
        SEÇÕES SELECIONADAS: {json.dumps(selected_sections, ensure_ascii=False, indent=2)}
        
        Avalie a qualidade da seleção de seções:
        1. Relevância (0-10): As seções são relevantes para a pergunta?
        2. Cobertura (0-10): As seções cobrem todos os aspectos da pergunta?
        3. Precisão (0-10): As seções contêm informações precisas?
        4. Completude (0-10): Há informações suficientes para responder?
        
        Retorne APENAS um JSON:
        {{
            "retriever_scores": {{
                "relevance": 0-10,
                "coverage": 0-10,
                "precision": 0-10,
                "completeness": 0-10,
                "overall": 0-10
            }},
            "issues": ["Lista de problemas identificados"],
            "recommendations": ["Lista de melhorias sugeridas"]
        }}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.evaluator_model,
                messages=[{"role": "user", "content": evaluation_prompt}],
                temperature=0.2
            )
            
            result = json.loads(response['choices'][0]['message']['content'])
            return result
            
        except Exception as e:
            print(f"Erro na avaliação do retriever: {e}")
            return {
                "retriever_scores": {"relevance": 5, "coverage": 5, "precision": 5, "completeness": 5, "overall": 5},
                "issues": ["Erro na avaliação"],
                "recommendations": ["Verificar configuração do sistema"]
            }
    
    async def evaluate_generator(self, query: str, response: str, selected_sections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Avalia a qualidade do generator (resposta final)
        """
        evaluation_prompt = f"""
        Você é um especialista em avaliação de sistemas RAG.
        
        PERGUNTA: {query}
        RESPOSTA GERADA: {response}
        SEÇÕES USADAS: {json.dumps(selected_sections, ensure_ascii=False, indent=2)}
        
        Avalie a qualidade da resposta:
        1. Precisão (0-10): A resposta é factualmente correta?
        2. Relevância (0-10): A resposta responde à pergunta?
        3. Completude (0-10): A resposta é completa?
        4. Clareza (0-10): A resposta é clara e bem estruturada?
        5. Fidelidade (0-10): A resposta se baseia nas seções fornecidas?
        
        Retorne APENAS um JSON:
        {{
            "generator_scores": {{
                "accuracy": 0-10,
                "relevance": 0-10,
                "completeness": 0-10,
                "clarity": 0-10,
                "fidelity": 0-10,
                "overall": 0-10
            }},
            "issues": ["Lista de problemas identificados"],
            "recommendations": ["Lista de melhorias sugeridas"]
        }}
        """
        
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.evaluator_model,
                messages=[{"role": "user", "content": evaluation_prompt}],
                temperature=0.2
            )
            
            result = json.loads(response['choices'][0]['message']['content'])
            return result
            
        except Exception as e:
            print(f"Erro na avaliação do generator: {e}")
            return {
                "generator_scores": {"accuracy": 5, "relevance": 5, "completeness": 5, "clarity": 5, "fidelity": 5, "overall": 5},
                "issues": ["Erro na avaliação"],
                "recommendations": ["Verificar configuração do sistema"]
            }
    
    async def detect_regressions(self, current_scores: Dict[str, Any], historical_scores: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detecta regressões comparando com histórico
        """
        if not historical_scores:
            return {"has_regression": False, "message": "Sem histórico para comparação"}
        
        # Calcula médias históricas
        avg_historical = {
            "retriever_overall": sum(s.get("retriever_scores", {}).get("overall", 5) for s in historical_scores[-10:]) / min(10, len(historical_scores)),
            "generator_overall": sum(s.get("generator_scores", {}).get("overall", 5) for s in historical_scores[-10:]) / min(10, len(historical_scores))
        }
        
        current_retriever = current_scores.get("retriever_scores", {}).get("overall", 5)
        current_generator = current_scores.get("generator_scores", {}).get("overall", 5)
        
        # Detecta regressões significativas (>20% de queda)
        retriever_regression = current_retriever < (avg_historical["retriever_overall"] * 0.8)
        generator_regression = current_generator < (avg_historical["generator_overall"] * 0.8)
        
        return {
            "has_regression": retriever_regression or generator_regression,
            "retriever_regression": retriever_regression,
            "generator_regression": generator_regression,
            "current_scores": {
                "retriever": current_retriever,
                "generator": current_generator
            },
            "historical_averages": avg_historical,
            "recommendations": self._generate_regression_recommendations(retriever_regression, generator_regression)
        }
    
    def _generate_regression_recommendations(self, retriever_regression: bool, generator_regression: bool) -> List[str]:
        """
        Gera recomendações baseadas no tipo de regressão
        """
        recommendations = []
        
        if retriever_regression:
            recommendations.extend([
                "Revisar critérios de seleção de seções",
                "Ajustar pesos de relevância",
                "Verificar qualidade dos resumos das seções"
            ])
        
        if generator_regression:
            recommendations.extend([
                "Revisar prompt de geração de resposta",
                "Verificar contexto fornecido ao generator",
                "Ajustar parâmetros de temperatura e max_tokens"
            ])
        
        if retriever_regression and generator_regression:
            recommendations.append("Revisar pipeline completo do RAG")
        
        return recommendations
    
    async def generate_improvement_suggestions(self, evaluation_results: Dict[str, Any]) -> List[str]:
        """
        Gera sugestões de melhoria baseadas na avaliação
        """
        suggestions = []
        
        retriever_scores = evaluation_results.get("retriever_scores", {})
        generator_scores = evaluation_results.get("generator_scores", {})
        
        # Sugestões para retriever
        if retriever_scores.get("relevance", 5) < 7:
            suggestions.append("Melhorar algoritmo de seleção de seções relevantes")
        
        if retriever_scores.get("coverage", 5) < 7:
            suggestions.append("Expandir critérios de busca para maior cobertura")
        
        if retriever_scores.get("precision", 5) < 7:
            suggestions.append("Refinar filtros de precisão na seleção")
        
        # Sugestões para generator
        if generator_scores.get("accuracy", 5) < 7:
            suggestions.append("Melhorar validação de fatos na resposta")
        
        if generator_scores.get("clarity", 5) < 7:
            suggestions.append("Refinar prompt para respostas mais claras")
        
        if generator_scores.get("fidelity", 5) < 7:
            suggestions.append("Melhorar alinhamento entre contexto e resposta")
        
        return suggestions


# Instância global
rag_evaluator = RAGEvaluator()
