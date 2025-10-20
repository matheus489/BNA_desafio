import { useState, useEffect, useRef } from 'react'
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
  const [copiedMessages, setCopiedMessages] = useState<Set<number>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Função para copiar mensagem e mostrar feedback
  async function handleCopyMessage(messageId: number, content: string) {
    const success = await copyToClipboard(content)
    if (success) {
      setCopiedMessages(prev => new Set(prev).add(messageId))
      setTimeout(() => {
        setCopiedMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }, 2000)
    }
  }

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
    height: '100vh',
    width: '100%',
    padding: '2rem 3rem',
    gap: '1.5rem',
    background: 'transparent'
  }

  const headerStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '1.75rem 2rem',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem'
  }

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: 0,
    textShadow: '0 2px 10px rgba(102, 126, 234, 0.5)'
  }

  const chatContainerStyles = {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    minHeight: 0
  }

  const messagesAreaStyles = {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem'
  }

  const messageStyles = (isUser: boolean) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    animation: 'fadeIn 0.4s ease-out'
  })

  const messageBubbleStyles = (isUser: boolean) => ({
    maxWidth: '75%',
    padding: '1.25rem 1.75rem',
    borderRadius: isUser ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
    background: isUser 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)'
      : 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    border: `1px solid ${isUser ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    color: 'white',
    boxShadow: isUser 
      ? '0 8px 32px rgba(102, 126, 234, 0.3)' 
      : '0 8px 32px rgba(0, 0, 0, 0.2)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    fontSize: '0.98rem'
  })

  const sourcesContainerStyles = (isUser: boolean) => ({
    marginTop: '1rem',
    padding: '1.25rem',
    background: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '0.9rem'
  })

  const sourceItemStyles = {
    marginBottom: '0.75rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    borderLeft: '3px solid rgba(102, 126, 234, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }

  const inputContainerStyles = {
    padding: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(20px)'
  }

  const inputRowStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  }

  const inputStyles = {
    flex: 1,
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
    minWidth: '140px',
    backdropFilter: 'blur(10px)'
  }

  const toggleStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '0.5rem'
  }

  const clearButtonStyles = {
    background: 'rgba(239, 68, 68, 0.2)',
    color: 'white',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)'
  }

  const emptyStateStyles = {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    color: 'rgba(255, 255, 255, 0.6)'
  }

  const badgeStyles = (type: string) => ({
    display: 'inline-block',
    padding: '0.375rem 0.875rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600' as const,
    marginRight: '0.75rem',
    background: type === 'database' 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)'
      : 'linear-gradient(135deg, rgba(72, 187, 120, 0.8) 0%, rgba(56, 161, 105, 0.8) 100%)',
    color: 'white',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  })

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
    fontWeight: '500' as const,
    position: 'absolute' as const,
    top: '0.75rem',
    right: '0.75rem',
    opacity: 0,
    transform: 'translateY(-5px)'
  }

  if (loadingHistory) {
    return (
      <div style={containerStyles}>
        <div style={emptyStateStyles}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'grayscale(0.5)' }}>⏳</div>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)' }}>Carregando histórico...</p>
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
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.4)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
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
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'grayscale(0.3)' }}>💬</div>
              <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: '600' }}>
                Bem-vindo ao Chat RAG!
              </h3>
              <p style={{ maxWidth: '700px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Faça perguntas sobre as empresas analisadas ou qualquer informação de vendas.
                <br />
                O sistema busca automaticamente no banco de dados e na internet para te dar as melhores respostas!
              </p>
              <div style={{ marginTop: '2.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <p style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '1rem' }}>Exemplos de perguntas:</p>
                <p style={{ marginBottom: '0.5rem' }}>• "Qual o stack tecnológico da empresa X?"</p>
                <p style={{ marginBottom: '0.5rem' }}>• "Quais empresas de IA já analisei?"</p>
                <p>• "Me dê informações sobre pricing de SaaS B2B"</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={messageStyles(msg.role === 'user')}>
                <div style={{ position: 'relative' as const }}>
                  <div 
                    style={messageBubbleStyles(msg.role === 'user')}
                    onMouseOver={(e) => {
                      const copyBtn = e.currentTarget.querySelector('.copy-button') as HTMLElement
                      if (copyBtn) {
                        copyBtn.style.opacity = '1'
                        copyBtn.style.transform = 'translateY(0)'
                      }
                    }}
                    onMouseOut={(e) => {
                      const copyBtn = e.currentTarget.querySelector('.copy-button') as HTMLElement
                      if (copyBtn && !copiedMessages.has(msg.id)) {
                        copyBtn.style.opacity = '0'
                        copyBtn.style.transform = 'translateY(-5px)'
                      }
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                    <button
                      className="copy-button"
                      style={{
                        ...copyButtonStyles,
                        background: copiedMessages.has(msg.id) 
                          ? 'rgba(16, 185, 129, 0.3)' 
                          : 'rgba(102, 126, 234, 0.2)',
                        borderColor: copiedMessages.has(msg.id) 
                          ? 'rgba(16, 185, 129, 0.5)' 
                          : 'rgba(102, 126, 234, 0.4)'
                      }}
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      onMouseOver={(e) => {
                        if (!copiedMessages.has(msg.id)) {
                          (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.3)'
                          ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!copiedMessages.has(msg.id)) {
                          (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
                          ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {copiedMessages.has(msg.id) ? '✅' : '📋'}
                    </button>
                  </div>
                  
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={sourcesContainerStyles(msg.role === 'user')}>
                      <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>📚 Fontes consultadas:</strong>
                      <div style={{ marginTop: '1rem' }}>
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
                                color: 'rgba(102, 126, 234, 1)', 
                                textDecoration: 'none',
                                fontWeight: '500',
                                fontSize: '0.95rem'
                              }}
                            >
                              {source.title}
                            </a>
                            {source.snippet && (
                              <div style={{ 
                                marginTop: '0.5rem', 
                                fontSize: '0.88rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                lineHeight: '1.5'
                              }}>
                                {source.snippet.substring(0, 150)}...
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
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Processando... (RAG + Web Search)</span>
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
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label style={{ fontSize: '0.95rem', userSelect: 'none' }}>
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
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.6)'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              style={{
                ...buttonStyles,
                opacity: (!input.trim() || loading) ? 0.5 : 1,
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer'
              }}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              onMouseOver={(e) => !loading && input.trim() && (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? '⏳ Enviando...' : '🚀 Enviar'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .typing-indicator {
          display: flex;
          gap: 5px;
        }

        .typing-indicator span {
          width: 9px;
          height: 9px;
          background: rgba(102, 126, 234, 0.9);
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
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-12px); opacity: 1; }
        }

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
