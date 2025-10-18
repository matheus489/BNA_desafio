import { useState } from 'react'
import axios from 'axios'

// Função para copiar texto para a área de transferência
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback para navegadores mais antigos
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

const API = 'http://localhost:8000'

export function Analyze() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [generatingReport, setGeneratingReport] = useState(false)

  // Função para copiar texto e mostrar feedback
  async function handleCopy(text: string, itemId: string) {
    const success = await copyToClipboard(text)
    if (success) {
      setCopiedItems(prev => new Set(prev).add(itemId))
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })
      }, 2000)
    }
  }

  // Função para gerar relatório PDF detalhado
  async function handleGenerateReport() {
    if (!result?.id || generatingReport) return
    
    setGeneratingReport(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API}/reports/generate/${result.id}`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      )
      
      // Cria blob e faz download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio_detalhado_${result.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err)
      alert('❌ Erro ao gerar relatório: ' + (err?.response?.data?.detail || 'Tente novamente.'))
    } finally {
      setGeneratingReport(false)
    }
  }

  // Envia a URL para a API e exibe o resultado
  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        `${API}/analyze`,
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao analisar')
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
  }

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

  const resultCardStyles = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '2.5rem',
    marginTop: '2rem',
    color: 'white'
  }

  const sectionStyles = {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
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

  const textStyles = {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: '1.8',
    fontSize: '1rem',
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    textAlign: 'left' as const
  }

  const errorStyles = {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: 'rgba(254, 202, 202, 1)',
    padding: '1.25rem',
    borderRadius: '12px',
    marginTop: '1rem',
    backdropFilter: 'blur(10px)'
  }

  const copyButtonStyles = {
    background: 'rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: '500' as const
  }

  const sectionHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  }

  const reportButtonStyles = {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.8) 100%)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backdropFilter: 'blur(10px)'
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h2 style={titleStyles}>
          🔍 Analisar URL
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            style={inputStyles} 
            placeholder="https://exemplo.com.br" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(102, 126, 234, 0.6)'
              ;(e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)'
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.15)'
              ;(e.target as HTMLInputElement).style.boxShadow = 'none'
            }}
          />
          <button 
            style={{
              ...buttonStyles,
              opacity: (!url || loading) ? 0.5 : 1,
              cursor: (!url || loading) ? 'not-allowed' : 'pointer'
            }}
            onClick={handleAnalyze} 
            disabled={!url || loading}
            onMouseOver={(e) => !loading && url && ((e.target as HTMLButtonElement).style.transform = 'translateY(-3px)')}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Analisando...' : '🚀 Analisar'}
          </button>
        </div>
        {error && <div style={errorStyles}>❌ {error}</div>}
      </div>

      {result && (
        <div style={resultCardStyles}>
          <div style={sectionStyles}>
            <div style={sectionHeaderStyles}>
              <div style={labelStyles}>
                📄 Título
              </div>
              <button
                style={{
                  ...reportButtonStyles,
                  opacity: generatingReport ? 0.5 : 1,
                  cursor: generatingReport ? 'not-allowed' : 'pointer'
                }}
                onClick={handleGenerateReport}
                disabled={generatingReport}
                onMouseOver={(e) => {
                  if (!generatingReport) {
                    (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(5, 150, 105, 0.9) 100%)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                    ;(e.target as HTMLButtonElement).style.boxShadow = '0 12px 48px rgba(16, 185, 129, 0.5)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!generatingReport) {
                    (e.target as HTMLButtonElement).style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.8) 100%)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                    ;(e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)'
                  }
                }}
              >
                {generatingReport ? '⏳ Gerando...' : '📊 Gerar Relatório'}
              </button>
            </div>
            <div style={{
              ...textStyles,
              fontSize: '1.4rem',
              fontWeight: '600' as const,
              color: 'white'
            }}>
              {result.title || 'Título não disponível'}
            </div>
          </div>

          <div style={sectionStyles}>
            <div style={sectionHeaderStyles}>
              <div style={labelStyles}>
                📝 Resumo
              </div>
              <button
                style={{
                  ...copyButtonStyles,
                  background: copiedItems.has('summary') 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : 'rgba(102, 126, 234, 0.2)',
                  borderColor: copiedItems.has('summary') 
                    ? 'rgba(16, 185, 129, 0.5)' 
                    : 'rgba(102, 126, 234, 0.4)'
                }}
                onClick={() => handleCopy(result.summary || 'Resumo não disponível.', 'summary')}
                onMouseOver={(e) => {
                  if (!copiedItems.has('summary')) {
                    (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.3)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseOut={(e) => {
                  if (!copiedItems.has('summary')) {
                    (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                  }
                }}
              >
                {copiedItems.has('summary') ? '✅ Copiado!' : '📋 Copiar'}
              </button>
            </div>
            <div style={{
              ...textStyles,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              lineHeight: '1.9'
            }}>
              {result.summary || 'Resumo não disponível.'}
            </div>
          </div>

          {result.key_points && result.key_points.length > 0 && (
            <div style={sectionStyles}>
              <div style={labelStyles}>
                📊 Informações Estruturadas
              </div>
              <div style={{
                display: 'grid',
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
              }}>
                {result.key_points.map((k: string, i: number) => {
                  // Extrai apenas o título da seção (sem emoji)
                  const titleMatch = k.match(/^[🎯🛍️💰🔧📞🏢🎯]\s*(.+?):\s*(.+)$/);
                  if (titleMatch) {
                    const [, title, content] = titleMatch;
                    return (
                      <div key={i} style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative' as const
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)'
                        e.currentTarget.style.boxShadow = '0 12px 48px rgba(102, 126, 234, 0.3)'
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            fontSize: '1.15rem',
                            fontWeight: '600' as const,
                            color: 'rgba(255, 255, 255, 0.95)',
                            borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                            paddingBottom: '0.75rem',
                            flex: 1
                          }}>
                            {title}
                          </div>
                          <button
                            style={{
                              ...copyButtonStyles,
                              background: copiedItems.has(`keypoint-${i}`) 
                                ? 'rgba(16, 185, 129, 0.3)' 
                                : 'rgba(102, 126, 234, 0.2)',
                              borderColor: copiedItems.has(`keypoint-${i}`) 
                                ? 'rgba(16, 185, 129, 0.5)' 
                                : 'rgba(102, 126, 234, 0.4)',
                              marginLeft: '1rem'
                            }}
                            onClick={() => handleCopy(`${title}:\n${content}`, `keypoint-${i}`)}
                            onMouseOver={(e) => {
                              if (!copiedItems.has(`keypoint-${i}`)) {
                                (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.3)'
                                ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!copiedItems.has(`keypoint-${i}`)) {
                                (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
                                ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                              }
                            }}
                          >
                            {copiedItems.has(`keypoint-${i}`) ? '✅' : '📋'}
                          </button>
                        </div>
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.98rem'
                        }}>
                          {content}
                        </div>
                      </div>
                    );
                  }
                  
                  // Fallback para formato antigo
                  return (
                    <div key={i} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      borderLeft: '4px solid rgba(102, 126, 234, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      position: 'relative' as const
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          {k}
                        </div>
                        <button
                          style={{
                            ...copyButtonStyles,
                            background: copiedItems.has(`fallback-${i}`) 
                              ? 'rgba(16, 185, 129, 0.3)' 
                              : 'rgba(102, 126, 234, 0.2)',
                            borderColor: copiedItems.has(`fallback-${i}`) 
                              ? 'rgba(16, 185, 129, 0.5)' 
                              : 'rgba(102, 126, 234, 0.4)',
                            flexShrink: 0
                          }}
                          onClick={() => handleCopy(k, `fallback-${i}`)}
                          onMouseOver={(e) => {
                            if (!copiedItems.has(`fallback-${i}`)) {
                              (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.3)'
                              ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!copiedItems.has(`fallback-${i}`)) {
                              (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
                              ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                            }
                          }}
                        >
                          {copiedItems.has(`fallback-${i}`) ? '✅' : '📋'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      <style>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.4);
          border-radius: 10px;
          border: 2px solid rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.6);
        }
      `}</style>
    </div>
  )
}
