import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    type: string
    title: string
    url: string
    snippet?: string
  }>
  created_at: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [useWebSearch, setUseWebSearch] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carrega histórico ao montar componente
  useEffect(() => {
    loadHistory()
  }, [])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadHistory() {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(data)
    } catch (err) {
      console.error('Erro ao carregar histórico:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Adiciona mensagem do usuário otimisticamente
    const tempUserMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        `${API}/chat`,
        {
          message: userMessage,
          use_web_search: useWebSearch,
          max_history: 10
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Adiciona resposta do assistente
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        sources: data.sources,
        created_at: data.timestamp
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err)
      // Adiciona mensagem de erro
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `❌ Erro: ${err?.response?.data?.detail || 'Falha ao processar mensagem'}`,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  async function clearHistory() {
    if (!confirm('Tem certeza que deseja limpar todo o histórico?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages([])
    } catch (err) {
      alert('Erro ao limpar histórico')
    }
  }

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: 'calc(100vh - 80px)',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem',
    gap: '1rem'
  }

  const headerStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  }

  const titleStyles = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0
  }

  const chatContainerStyles = {
    flex: 1,
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden'
  }

  const messagesAreaStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  }

  const messageStyles = (isUser: boolean) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    animation: 'fadeIn 0.3s ease-in'
  })

  const messageBubbleStyles = (isUser: boolean) => ({
    maxWidth: '70%',
    padding: '1rem 1.5rem',
    borderRadius: isUser ? '20px 20px 0 20px' : '20px 20px 20px 0',
    background: isUser 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#f7fafc',
    color: isUser ? 'white' : '#2d3748',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const
  })

  const sourcesContainerStyles = (isUser: boolean) => ({
    marginTop: '1rem',
    padding: '1rem',
    background: isUser ? 'rgba(255, 255, 255, 0.1)' : '#edf2f7',
    borderRadius: '12px',
    fontSize: '0.9rem'
  })

  const sourceItemStyles = {
    marginBottom: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    borderLeft: '3px solid #667eea'
  }

  const inputContainerStyles = {
    padding: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    background: '#f8f9fa'
  }

  const inputRowStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  }

  const inputStyles = {
    flex: 1,
    padding: '1rem',
    border: '2px solid #e1e5e9',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease'
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
    minWidth: '120px'
  }

  const toggleStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: '#4a5568'
  }

  const clearButtonStyles = {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }

  const emptyStateStyles = {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: '#a0aec0'
  }

  const badgeStyles = (type: string) => ({
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginRight: '0.5rem',
    background: type === 'database' ? '#667eea' : '#48bb78',
    color: 'white'
  })

  if (loadingHistory) {
    return (
      <div style={containerStyles}>
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={titleStyles}>
          🤖 Chat RAG - Assistente Inteligente
        </h1>
        <button 
          style={clearButtonStyles}
          onClick={clearHistory}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          🗑️ Limpar Histórico
        </button>
      </div>

      {/* Chat Container */}
      <div style={chatContainerStyles}>
        {/* Messages Area */}
        <div style={messagesAreaStyles}>
          {messages.length === 0 ? (
            <div style={emptyStateStyles}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>
                Bem-vindo ao Chat RAG!
              </h3>
              <p style={{ maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                Faça perguntas sobre as empresas analisadas ou qualquer informação de vendas.
                <br />
                O sistema busca automaticamente no banco de dados e na internet para te dar as melhores respostas!
              </p>
              <div style={{ marginTop: '2rem', color: '#718096' }}>
                <p><strong>Exemplos de perguntas:</strong></p>
                <p>• "Qual o stack tecnológico da empresa X?"</p>
                <p>• "Quais empresas de IA já analisei?"</p>
                <p>• "Me dê informações sobre pricing de SaaS B2B"</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={messageStyles(msg.role === 'user')}>
                <div>
                  <div style={messageBubbleStyles(msg.role === 'user')}>
                    {msg.content}
                  </div>
                  
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={sourcesContainerStyles(msg.role === 'user')}>
                      <strong>📚 Fontes consultadas:</strong>
                      <div style={{ marginTop: '0.5rem' }}>
                        {msg.sources.map((source, idx) => (
                          <div key={idx} style={sourceItemStyles}>
                            <span style={badgeStyles(source.type)}>
                              {source.type === 'database' ? '💾 Banco' : '🌐 Web'}
                            </span>
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ 
                                color: '#667eea', 
                                textDecoration: 'none',
                                fontWeight: '500'
                              }}
                            >
                              {source.title}
                            </a>
                            {source.snippet && (
                              <div style={{ 
                                marginTop: '0.25rem', 
                                fontSize: '0.85rem',
                                color: '#718096'
                              }}>
                                {source.snippet.substring(0, 100)}...
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div style={messageStyles(false)}>
              <div style={messageBubbleStyles(false)}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  Processando... (RAG + Web Search)
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={inputContainerStyles}>
          <div style={toggleStyles}>
            <input 
              type="checkbox" 
              checked={useWebSearch} 
              onChange={(e) => setUseWebSearch(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label>
              🌐 Ativar busca automática na internet (recomendado)
            </label>
          </div>
          
          <div style={inputRowStyles}>
            <input
              style={inputStyles}
              placeholder="Digite sua pergunta sobre vendas, empresas, tecnologias..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
            <button
              style={{
                ...buttonStyles,
                opacity: (!input.trim() || loading) ? 0.6 : 1,
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer'
              }}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              onMouseOver={(e) => !loading && input.trim() && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? '⏳ Enviando...' : '🚀 Enviar'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

