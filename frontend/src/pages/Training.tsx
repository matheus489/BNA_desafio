import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000';

interface Objection {
  id: number;
  objection: string;
  type: string;
  difficulty: string;
  hint: string;
  suggested_response: string;
  context: string;
}

interface Evaluation {
  score: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  tone_analysis: string;
  overall_feedback: string;
}

interface Analysis {
  id: number;
  url: string;
  title: string;
}

interface TrainingStats {
  total_sessions: number;
  average_score: number;
  sessions_by_difficulty: Record<string, number>;
  sessions_by_type: Record<string, number>;
}

const Training: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [objections, setObjections] = useState<Objection[]>([]);
  const [currentObjectionIndex, setCurrentObjectionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [companyContext, setCompanyContext] = useState('');
  const [overallStrategy, setOverallStrategy] = useState('');
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  const token = localStorage.getItem('token');

  // Estilos consistentes com outras páginas
  const containerStyles = {
    width: '100%',
    minHeight: 'calc(100vh - 100px)',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem'
  }

  const cardStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '2.5rem',
    color: 'white'
  }

  const inputStyles = {
    width: '100%',
    padding: '1.25rem',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    color: 'white'
  } as React.CSSProperties

  const buttonStyles = {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    color: 'white',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    padding: '1.25rem 2.5rem',
    borderRadius: '16px',
    fontSize: '1rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
    minWidth: '160px',
    backdropFilter: 'blur(10px)'
  }

  const titleStyles = {
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textShadow: '0 2px 10px rgba(102, 126, 234, 0.5)'
  }

  const labelStyles = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600' as const,
    fontSize: '1.2rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  }

  useEffect(() => {
    loadAnalyses();
    loadStats();
  }, []);

  const loadAnalyses = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(response.data);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/training/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const generateObjections = async () => {
    if (!selectedAnalysis) {
      alert('Selecione uma empresa para treinar!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/training/objections/generate`,
        {
          analysis_id: selectedAnalysis,
          difficulty: difficulty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setObjections(response.data.objections);
      setCompanyContext(response.data.company_context);
      setOverallStrategy(response.data.overall_strategy);
      setCurrentObjectionIndex(0);
      setUserResponse('');
      setEvaluation(null);
      setShowHint(false);
    } catch (error: any) {
      alert('Erro ao gerar objeções: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!userResponse.trim()) {
      alert('Digite sua resposta primeiro!');
      return;
    }

    const currentObjection = objections[currentObjectionIndex];
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/training/objections/submit`,
        {
          objection: currentObjection.objection,
          objection_type: currentObjection.type,
          user_response: userResponse,
          suggested_response: currentObjection.suggested_response,
          company_context: companyContext,
          analysis_id: selectedAnalysis,
          difficulty: difficulty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setEvaluation(response.data.evaluation);
      await loadStats(); // Recarrega estatísticas
    } catch (error: any) {
      alert('Erro ao avaliar resposta: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const nextObjection = () => {
    if (currentObjectionIndex < objections.length - 1) {
      setCurrentObjectionIndex(currentObjectionIndex + 1);
      setUserResponse('');
      setEvaluation(null);
      setShowHint(false);
    } else {
      alert('Você completou todas as objeções! Parabéns! 🎉');
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'rgba(34, 197, 94, 0.8)';
    if (grade.startsWith('B')) return 'rgba(59, 130, 246, 0.8)';
    if (grade.startsWith('C')) return 'rgba(245, 158, 11, 0.8)';
    return 'rgba(239, 68, 68, 0.8)';
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'easy') return 'rgba(34, 197, 94, 0.2)';
    if (diff === 'medium') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(239, 68, 68, 0.2)';
  };

  const currentObjection = objections[currentObjectionIndex];

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={titleStyles}>
              🎯 Simulador de Objeções
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>
              Treine suas habilidades de resposta a objeções com IA
            </p>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              ...buttonStyles,
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              minWidth: 'auto'
            }}
          >
            {showStats ? '🎮 Treinar' : '📊 Estatísticas'}
          </button>
        </div>

        {/* Stats Panel */}
        {showStats && stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total_sessions}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Sessões Totais</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.8) 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.average_score}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Score Médio</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats.sessions_by_difficulty.easy || 0}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Fáceis</div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.8) 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {stats.sessions_by_difficulty.hard || 0}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Difíceis</div>
            </div>
          </div>
        )}
      </div>

      {!showStats && (
        <>
          {/* Setup Panel */}
          {objections.length === 0 && (
            <div style={cardStyles}>
              <h2 style={{ ...titleStyles, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                ⚙️ Configuração do Treino
              </h2>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2rem' 
              }}>
                {/* Select Company */}
                <div>
                  <label style={labelStyles}>
                    🏢 Empresa para Treinar
                  </label>
                  <select
                    value={selectedAnalysis || ''}
                    onChange={(e) => setSelectedAnalysis(Number(e.target.value))}
                    style={inputStyles}
                  >
                    <option value="" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
                      Selecione uma empresa...
                    </option>
                    {analyses.map((analysis) => (
                      <option 
                        key={analysis.id} 
                        value={analysis.id}
                        style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}
                      >
                        {analysis.title || analysis.url}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Difficulty */}
                <div>
                  <label style={labelStyles}>
                    🎯 Dificuldade
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    {(['easy', 'medium', 'hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        style={{
                          ...buttonStyles,
                          padding: '1rem',
                          fontSize: '0.9rem',
                          background: difficulty === diff 
                            ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          border: difficulty === diff 
                            ? '1px solid rgba(102, 126, 234, 0.5)'
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          minWidth: 'auto'
                        }}
                      >
                        {diff === 'easy' && '😊 Fácil'}
                        {diff === 'medium' && '🤔 Médio'}
                        {diff === 'hard' && '😰 Difícil'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={generateObjections}
                disabled={loading || !selectedAnalysis}
                style={{
                  ...buttonStyles,
                  width: '100%',
                  marginTop: '2rem',
                  padding: '1.5rem',
                  fontSize: '1.1rem',
                  opacity: loading || !selectedAnalysis ? 0.5 : 1,
                  cursor: loading || !selectedAnalysis ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Gerando Objeções...' : '🚀 Gerar Objeções e Começar!'}
              </button>
            </div>
          )}

          {/* Training Panel */}
          {objections.length > 0 && currentObjection && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Progress */}
              <div style={cardStyles}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem', fontWeight: '600' }}>
                    Objeção {currentObjectionIndex + 1} de {objections.length}
                  </span>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    background: getDifficultyColor(currentObjection.difficulty),
                    color: 'white'
                  }}>
                    {currentObjection.difficulty.toUpperCase()}
                  </span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', height: '8px' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
                      height: '8px',
                      borderRadius: '10px',
                      transition: 'width 0.3s ease',
                      width: `${((currentObjectionIndex + 1) / objections.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Objection Card */}
              <div style={cardStyles}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    😤
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                        Objeção do Cliente
                      </h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: 'rgba(59, 130, 246, 1)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        borderRadius: '12px'
                      }}>
                        {currentObjection.type}
                      </span>
                    </div>
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: '1.6',
                      fontStyle: 'italic',
                      margin: 0
                    }}>
                      "{currentObjection.objection}"
                    </p>
                  </div>
                </div>

                {/* Hint Button */}
                {!evaluation && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: 'rgba(245, 158, 11, 1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {showHint ? '🙈 Esconder Dica' : '💡 Ver Dica'}
                  </button>
                )}

                {showHint && !evaluation && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderLeft: '4px solid rgba(245, 158, 11, 0.8)',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: 'rgba(245, 158, 11, 1)', fontSize: '0.9rem', margin: 0 }}>
                      <strong>💡 Dica:</strong> {currentObjection.hint}
                    </p>
                  </div>
                )}
              </div>

              {/* Response Input */}
              {!evaluation && (
                <div style={cardStyles}>
                  <label style={labelStyles}>
                    ✍️ Sua Resposta
                  </label>
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Digite sua resposta à objeção aqui... Seja consultivo, empático e baseado em valor."
                    rows={6}
                    style={{
                      ...inputStyles,
                      resize: 'none'
                    } as React.CSSProperties}
                  />
                  <button
                    onClick={submitResponse}
                    disabled={loading || !userResponse.trim()}
                    style={{
                      ...buttonStyles,
                      width: '100%',
                      marginTop: '1rem',
                      padding: '1.25rem',
                      fontSize: '1.1rem',
                      opacity: loading || !userResponse.trim() ? 0.5 : 1,
                      cursor: loading || !userResponse.trim() ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? '⏳ Avaliando...' : '✅ Submeter Resposta'}
                  </button>
                </div>
              )}

              {/* Evaluation */}
              {evaluation && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Score Card */}
                  <div style={{
                    ...cardStyles,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          Sua Nota
                        </div>
                        <div style={{ 
                          fontSize: '3rem', 
                          fontWeight: 'bold',
                          color: getGradeColor(evaluation.grade)
                        }}>
                          {evaluation.grade}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          Score
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{evaluation.score}</div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div style={cardStyles}>
                    <h3 style={{ ...titleStyles, fontSize: '1.3rem', marginBottom: '1.5rem' }}>
                      📝 Feedback Detalhado
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Overall Feedback */}
                      <div style={{
                        padding: '1.5rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, lineHeight: '1.6' }}>
                          {evaluation.overall_feedback}
                        </p>
                      </div>

                      {/* Strengths */}
                      {evaluation.strengths.length > 0 && (
                        <div>
                          <h4 style={{ color: 'rgba(34, 197, 94, 1)', fontWeight: '600', marginBottom: '0.75rem' }}>
                            ✅ Pontos Fortes:
                          </h4>
                          <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '1.5rem' }}>
                            {evaluation.strengths.map((strength, idx) => (
                              <li key={idx} style={{ marginBottom: '0.5rem' }}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {evaluation.weaknesses.length > 0 && (
                        <div>
                          <h4 style={{ color: 'rgba(239, 68, 68, 1)', fontWeight: '600', marginBottom: '0.75rem' }}>
                            ⚠️ Pontos Fracos:
                          </h4>
                          <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '1.5rem' }}>
                            {evaluation.weaknesses.map((weakness, idx) => (
                              <li key={idx} style={{ marginBottom: '0.5rem' }}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {evaluation.improvements.length > 0 && (
                        <div>
                          <h4 style={{ color: 'rgba(102, 126, 234, 1)', fontWeight: '600', marginBottom: '0.75rem' }}>
                            🚀 Como Melhorar:
                          </h4>
                          <ul style={{ color: 'rgba(255, 255, 255, 0.8)', margin: 0, paddingLeft: '1.5rem' }}>
                            {evaluation.improvements.map((improvement, idx) => (
                              <li key={idx} style={{ marginBottom: '0.5rem' }}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tone Analysis */}
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px'
                      }}>
                        <h4 style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', marginBottom: '0.5rem' }}>
                          🎭 Análise de Tom:
                        </h4>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                          {evaluation.tone_analysis}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Response */}
                  <div style={cardStyles}>
                    <h3 style={{ ...titleStyles, fontSize: '1.3rem', marginBottom: '1rem' }}>
                      💎 Resposta Sugerida
                    </h3>
                    <div style={{
                      padding: '1.5rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderLeft: '4px solid rgba(34, 197, 94, 0.8)',
                      borderRadius: '8px'
                    }}>
                      <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, lineHeight: '1.6' }}>
                        {currentObjection.suggested_response}
                      </p>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextObjection}
                    style={{
                      ...buttonStyles,
                      width: '100%',
                      padding: '1.5rem',
                      fontSize: '1.1rem'
                    }}
                  >
                    {currentObjectionIndex < objections.length - 1 ? '➡️ Próxima Objeção' : '🎉 Finalizar Treino'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Training;