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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem'
  }

  const cardStyles = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    marginBottom: '2rem'
  }

  const inputStyles = {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e1e5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    background: '#f8f9fa'
  }

  const buttonStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
    minWidth: '140px'
  }

  const resultCardStyles = {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    marginTop: '2rem'
  }

  const sectionStyles = {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #f0f0f0'
  }

  const titleStyles = {
    color: '#2d3748',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }

  const labelStyles = {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }

  const textStyles = {
    color: '#2d3748',
    lineHeight: '1.8',
    fontSize: '1rem',
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    textAlign: 'justify' as const
  }

  const listStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  }

  const listItemStyles = {
    background: '#f7fafc',
    padding: '0.75rem 1rem',
    marginBottom: '0.5rem',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
    color: '#2d3748',
    lineHeight: '1.6',
    fontSize: '0.95rem',
    wordWrap: 'break-word' as const,
    textAlign: 'left' as const
  }

  const jsonStyles = {
    background: '#1a202c',
    color: '#e2e8f0',
    padding: '1.5rem',
    borderRadius: '12px',
    fontSize: '0.9rem',
    overflow: 'auto',
    fontFamily: 'Monaco, Consolas, monospace'
  }

  const errorStyles = {
    background: '#fed7d7',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #feb2b2',
    marginTop: '1rem'
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h2 style={titleStyles}>
          🔍 Analisar URL
        </h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            style={inputStyles} 
            placeholder="https://exemplo.com.br" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#667eea'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#e1e5e9'}
          />
          <button 
            style={{
              ...buttonStyles,
              opacity: (!url || loading) ? 0.6 : 1,
              cursor: (!url || loading) ? 'not-allowed' : 'pointer'
            }}
            onClick={handleAnalyze} 
            disabled={!url || loading}
            onMouseOver={(e) => !loading && url && ((e.target as HTMLButtonElement).style.transform = 'translateY(-2px)')}
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
              fontSize: '1.2rem',
              fontWeight: '600',
              textAlign: 'left' as const
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
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
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
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}>
                {result.key_points.map((k: string, i: number) => {
                  // Extrai o emoji e título da seção
                  const emojiMatch = k.match(/^([🎯🛍️💰🔧📞🏢])\s*(.+?):\s*(.+)$/);
                  if (emojiMatch) {
                    const [, emoji, title, content] = emojiMatch;
                    return (
                      <div key={i} style={{
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#495057'
                        }}>
                          <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                          <span>{title}</span>
                        </div>
                        <div style={{
                          color: '#6c757d',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {content}
                        </div>
                      </div>
                    );
                  }
                  
                  // Fallback para formato antigo
                  return (
                    <div key={i} style={{
                      background: '#f7fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      borderLeft: '4px solid #667eea',
                      color: '#2d3748'
                    }}>
                      {k}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.entities && (
            <div style={sectionStyles}>
              <div style={labelStyles}>
                🔧 Dados Estruturados
              </div>
              <div style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
              }}>
                {Object.entries(result.entities).map(([key, value], index) => {
                  const labels: { [key: string]: string } = {
                    company_name: '🏢 Empresa',
                    products: '🛍️ Produtos',
                    pricing: '💰 Preços',
                    tech_stack: '🔧 Tecnologias',
                    contacts: '📞 Contatos'
                  };
                  
                  const emoji = labels[key]?.split(' ')[0] || '📋';
                  const title = labels[key]?.split(' ').slice(1).join(' ') || key;
                  
                  return (
                    <div key={index} style={{
                      background: 'white',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#495057'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                        <span>{title}</span>
                      </div>
                      <div style={{
                        color: '#6c757d',
                        lineHeight: '1.5'
                      }}>
                        {Array.isArray(value) ? (
                          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                            {value.map((item, i) => (
                              <li key={i} style={{ marginBottom: '0.25rem' }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {String(value)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


