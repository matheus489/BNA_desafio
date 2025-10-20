import { Link, Outlet, useNavigate } from 'react-router-dom'

export function App() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // Função para forçar refresh do token
  async function refreshToken() {
    try {
      const response = await fetch('http://localhost:8000/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        // Busca a role atualizada
        const meResponse = await fetch('http://localhost:8000/auth/me', {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        })
        if (meResponse.ok) {
          const userData = await meResponse.json()
          localStorage.setItem('role', userData.role)
          window.location.reload() // Recarrega para atualizar a UI
        }
      }
    } catch (error) {
      console.error('Erro ao refresh token:', error)
    }
  }
  
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    position: 'relative' as const,
    overflow: 'hidden'
  }

  const backgroundPatternStyles = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const
  }

  const headerStyles = {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '1.25rem 3rem',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    width: '100%'
  }

  const navStyles = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '100%'
  }

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold' as const,
    margin: 0
  }

  const logoImageStyles = {
    height: '45px',
    width: 'auto',
    filter: 'brightness(0) invert(1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  const linkStyles = {
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500' as const,
    fontSize: '0.95rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  }

  const buttonStyles = {
    background: 'rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
    color: 'white',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: '500' as const,
    fontSize: '0.9rem',
    backdropFilter: 'blur(10px)'
  }

  const mainStyles = {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    zIndex: 1
  }

  return (
    <div style={containerStyles}>
      <div style={backgroundPatternStyles} />
      
      <header style={headerStyles}>
        <nav style={navStyles}>
          <div style={logoStyles}>
            <img 
              src="https://www.bna.dev.br/assets/bnadev_logo-Cb23hnmr.svg" 
              alt="BNA Logo" 
              style={logoImageStyles}
              onMouseOver={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.08) rotate(2deg)'}
              onMouseOut={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1) rotate(0deg)'}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/dashboard" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              📊 Dashboard
            </Link>
            
            <Link 
              to="/kanban" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              📋 Pipeline
            </Link>
            
            <Link 
              to="/analyze" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              📊 Analisar
            </Link>
            
            <Link 
              to="/chat" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              🤖 Chat RAG
            </Link>
            
            <Link 
              to="/compare" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              🔄 Comparar
            </Link>
            
            <Link 
              to="/history" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              📋 Histórico
            </Link>
            
            <Link 
              to="/training" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              🎯 Treinar
            </Link>
            
            {token && role === 'admin' && (
              <Link 
                to="/admin" 
                style={linkStyles} 
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                  ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                  ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
                }} 
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                  ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                ⚙️ Admin
              </Link>
            )}
            
            <Link 
              to="/settings" 
              style={linkStyles} 
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
              }} 
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
            >
              ⚙️ Configurações
            </Link>
            
            {token ? (
              <>
                <button 
                  style={buttonStyles}
                  onClick={refreshToken}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.4)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                    ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(102, 126, 234, 0.6)'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                    ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(102, 126, 234, 0.4)'
                  }}
                >
                  🔄 Atualizar
                </button>
                
                <button 
                  style={buttonStyles}
                  onClick={() => { 
                    localStorage.removeItem('token')
                    localStorage.removeItem('role')
                    navigate('/login') 
                  }}
                  onMouseOver={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.3)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                    ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(239, 68, 68, 0.5)'
                  }}
                  onMouseOut={(e) => {
                    (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
                    ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                    ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(102, 126, 234, 0.4)'
                  }}
                >
                  🚪 Sair
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                style={linkStyles} 
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(102, 126, 234, 0.3)'
                  ;(e.target as HTMLElement).style.transform = 'translateY(-2px)'
                  ;(e.target as HTMLElement).style.borderColor = 'rgba(102, 126, 234, 0.5)'
                }} 
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'
                  ;(e.target as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                🔑 Entrar
              </Link>
            )}
          </div>
        </nav>
      </header>
      
      <main style={mainStyles}>
        <Outlet />
      </main>
      
    </div>
  )
}


