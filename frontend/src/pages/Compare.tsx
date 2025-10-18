import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Analysis {
  id: number
  title: string
  url: string
  created_at: string
}

interface Comparison {
  executive_summary: string
  tech_stack_comparison: string
  pricing_comparison: string
  icp_fit_comparison: string
  unique_opportunities: string
  recommended_ranking: Array<{
    position: number
    company: string
    reason: string
  }>
  approach_strategy: string
  companies: Analysis[]
}

export function Compare() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const comparisonRef = useRef<HTMLDivElement>(null)

  // Carrega histórico ao montar
  useEffect(() => {
    loadHistory()
  }, [])

  // Scroll automático quando comparação é gerada
  useEffect(() => {
    if (comparison && comparisonRef.current) {
      comparisonRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, [comparison])

  async function loadHistory() {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalyses(data)
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
    }
  }

  function toggleSelection(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      if (selectedIds.length >= 5) {
        alert('⚠️ Máximo de 5 empresas podem ser comparadas por vez')
        return
      }
      setSelectedIds([...selectedIds, id])
    }
  }

  async function handleCompare() {
    if (selectedIds.length < 2) {
      alert('⚠️ Selecione pelo menos 2 empresas para comparar')
      return
    }

    setLoading(true)
    setError(null)
    setComparison(null)

    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        `${API}/analyze/compare`,
        selectedIds,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComparison(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao gerar comparação')
    } finally {
      setLoading(false)
    }
  }

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

  const titleStyles = {
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textShadow: '0 2px 10px rgba(102, 126, 234, 0.5)'
  }

  const buttonStyles = {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    color: 'white',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
    backdropFilter: 'blur(10px)'
  }

  const sectionStyles = {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  }

  const labelStyles = {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600' as const,
    fontSize: '1.3rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  }

  const textStyles = {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.8',
    fontSize: '1rem',
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const
  }

  return (
    <div style={containerStyles}>
      {/* Card de Seleção */}
      <div style={cardStyles}>
        <h2 style={titleStyles}>
          🔄 Comparar Empresas
        </h2>
        
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
          Selecione 2-5 empresas para comparar lado a lado e receber recomendações de qual abordar primeiro.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
              {selectedIds.length} de 5 empresas selecionadas
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Limpar Seleção
              </button>
            )}
          </div>

          <div style={{ 
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {analyses.map(analysis => {
              const isSelected = selectedIds.includes(analysis.id)
              return (
                <div
                  key={analysis.id}
                  onClick={() => toggleSelection(analysis.id)}
                  style={{
                    background: isSelected 
                      ? 'rgba(102, 126, 234, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isSelected
                      ? '2px solid rgba(102, 126, 234, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative' as const
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'rgba(102, 126, 234, 0.9)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem'
                    }}>
                      ✓
                    </div>
                  )}
                  <div style={{
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    fontSize: '1.05rem',
                    paddingRight: '2rem'
                  }}>
                    {analysis.title || 'Sem título'}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {analysis.url}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.8rem'
                  }}>
                    {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2 || loading}
          style={{
            ...buttonStyles,
            opacity: selectedIds.length < 2 || loading ? 0.5 : 1,
            cursor: selectedIds.length < 2 || loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            if (selectedIds.length >= 2 && !loading) {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
              ;(e.target as HTMLButtonElement).style.boxShadow = '0 12px 48px rgba(102, 126, 234, 0.5)'
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
            ;(e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)'
          }}
        >
          {loading ? '⏳ Comparando...' : `🔍 Comparar ${selectedIds.length} Empresas`}
        </button>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: 'rgba(254, 202, 202, 1)',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Card de Resultado */}
      {comparison && (
        <div ref={comparisonRef} style={cardStyles}>
          <h2 style={{ ...titleStyles, fontSize: '1.75rem' }}>
            📊 Análise Comparativa
          </h2>

          {/* Resumo Executivo */}
          <div style={sectionStyles}>
            <div style={labelStyles}>
              📋 Resumo Executivo
            </div>
            <div style={{
              ...textStyles,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {comparison.executive_summary}
            </div>
          </div>

          {/* Ranking Recomendado - DESTAQUE */}
          <div style={{
            ...sectionStyles,
            background: 'rgba(102, 126, 234, 0.1)',
            border: '2px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ ...labelStyles, fontSize: '1.5rem' }}>
              🏆 Ranking de Prioridade
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comparison.recommended_ranking.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: idx === 0 
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: idx === 0
                      ? '2px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}
                >
                  <div style={{
                    background: idx === 0 
                      ? 'rgba(16, 185, 129, 0.8)'
                      : 'rgba(102, 126, 234, 0.6)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '3rem',
                    height: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {item.position}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: 'white',
                      fontSize: '1.15rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {item.company}
                      {idx === 0 && (
                        <span style={{
                          marginLeft: '0.75rem',
                          fontSize: '0.85rem',
                          background: 'rgba(16, 185, 129, 0.3)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px'
                        }}>
                          ⭐ PRIORITÁRIA
                        </span>
                      )}
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.95rem'
                    }}>
                      {item.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stack Tecnológico */}
          <div style={sectionStyles}>
            <div style={labelStyles}>
              🔧 Comparação de Stack Tecnológico
            </div>
            <div style={{
              ...textStyles,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {comparison.tech_stack_comparison}
            </div>
          </div>

          {/* Pricing */}
          <div style={sectionStyles}>
            <div style={labelStyles}>
              💰 Comparação de Pricing
            </div>
            <div style={{
              ...textStyles,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {comparison.pricing_comparison}
            </div>
          </div>

          {/* ICP Fit */}
          <div style={sectionStyles}>
            <div style={labelStyles}>
              🎯 Comparação de ICP Fit
            </div>
            <div style={{
              ...textStyles,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {comparison.icp_fit_comparison}
            </div>
          </div>

          {/* Oportunidades Únicas */}
          <div style={sectionStyles}>
            <div style={labelStyles}>
              💡 Oportunidades Únicas
            </div>
            <div style={{
              ...textStyles,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {comparison.unique_opportunities}
            </div>
          </div>

          {/* Estratégia de Abordagem */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <div style={{ ...labelStyles, fontSize: '1.4rem' }}>
              🎯 Estratégia de Abordagem Recomendada
            </div>
            <div style={{
              ...textStyles,
              fontSize: '1.05rem',
              fontWeight: '500'
            }}>
              {comparison.approach_strategy}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

