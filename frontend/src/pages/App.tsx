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
  
  const headerStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '0 0 12px 12px',
    marginBottom: '2rem'
  }

  const navStyles = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

         const logoStyles = {
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           fontSize: '1.5rem',
           fontWeight: 'bold',
           margin: 0
         }

         const logoImageStyles = {
           height: '50px',
           width: 'auto',
           filter: 'brightness(0) invert(1)', // Torna o logo branco
           transition: 'all 0.3s ease'
         }

  const linkStyles = {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  }

  const buttonStyles = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  }

  return (
    <div style={{ 
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      margin: 0,
      padding: 0
    }}>
      <header style={headerStyles}>
               <nav style={navStyles}>
                 <div style={logoStyles}>
                   <img 
                     src="https://www.bna.dev.br/assets/bnadev_logo-Cb23hnmr.svg" 
                     alt="BNA Logo" 
                     style={logoImageStyles}
                     onMouseOver={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.05)'}
                     onMouseOut={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1)'}
                   />
                 </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/analyze" style={linkStyles} onMouseOver={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'} onMouseOut={(e) => (e.target as HTMLElement).style.background = 'transparent'}>
              📊 Analisar
            </Link>
            <Link to="/chat" style={linkStyles} onMouseOver={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'} onMouseOut={(e) => (e.target as HTMLElement).style.background = 'transparent'}>
              🤖 Chat RAG
            </Link>
            <Link to="/history" style={linkStyles} onMouseOver={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'} onMouseOut={(e) => (e.target as HTMLElement).style.background = 'transparent'}>
              📋 Histórico
            </Link>
            {token && role === 'admin' && (
              <Link to="/admin" style={linkStyles} onMouseOver={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'} onMouseOut={(e) => (e.target as HTMLElement).style.background = 'transparent'}>
                ⚙️ Admin
              </Link>
            )}
            {token ? (
              <>
                <button 
                  style={{...buttonStyles, background: 'rgba(255, 255, 255, 0.1)', marginRight: '0.5rem'}}
                  onClick={refreshToken}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  🔄 Atualizar
                </button>
                <button 
                  style={buttonStyles}
                  onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); navigate('/login') }}
                  onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  🚪 Sair
                </button>
              </>
            ) : (
              <Link to="/login" style={linkStyles} onMouseOver={(e) => (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'} onMouseOut={(e) => (e.target as HTMLElement).style.background = 'transparent'}>
                🔑 Entrar
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main style={{ padding: '0 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}


