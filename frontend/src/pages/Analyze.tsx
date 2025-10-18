import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export function Analyze() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
            <div style={labelStyles}>
              📄 Título
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
            <div style={labelStyles}>
              📝 Resumo
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
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                          marginBottom: '1rem',
                          fontSize: '1.15rem',
                          fontWeight: '600' as const,
                          color: 'rgba(255, 255, 255, 0.95)',
                          borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                          paddingBottom: '0.75rem'
                        }}>
                          {title}
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
                      color: 'rgba(255, 255, 255, 0.9)'
                    }}>
                      {k}
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
