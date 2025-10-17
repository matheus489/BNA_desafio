import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:8000'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Registra (opcional) e autentica, salvando token e role no localStorage
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        await axios.post(`${API}/auth/register`, { email, password })
      }
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)
      const { data } = await axios.post(`${API}/auth/login`, form)
      localStorage.setItem('token', data.access_token)
      // fetch role for admin link
      const me = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${data.access_token}` } })
      localStorage.setItem('role', me.data.role)
      navigate('/analyze')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  }

  const cardStyles = {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    padding: '3rem',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center' as const
  }

         const titleStyles = {
           fontSize: '2rem',
           fontWeight: 'bold',
           marginBottom: '1rem',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }

         const logoImageStyles = {
           height: '80px',
           width: 'auto',
           filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)', // Aplica o gradiente ao logo
           transition: 'all 0.3s ease'
         }

  const subtitleStyles = {
    color: '#6b7280',
    marginBottom: '2rem',
    fontSize: '1rem'
  }

         const inputStyles = {
           width: '100%',
           padding: '1rem',
           border: '2px solid #e5e7eb',
           borderRadius: '12px',
           fontSize: '1rem',
           outline: 'none',
           transition: 'all 0.3s ease',
           background: '#f9fafb',
           marginBottom: '1rem',
           minHeight: '48px',
           boxSizing: 'border-box' as const
         }

         const buttonStyles = {
           width: '100%',
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           color: 'white',
           border: 'none',
           padding: '1rem',
           borderRadius: '12px',
           fontSize: '1rem',
           fontWeight: '600',
           cursor: 'pointer',
           transition: 'all 0.3s ease',
           boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
           marginBottom: '1rem',
           minHeight: '48px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }

         const toggleButtonStyles = {
           background: 'transparent',
           color: '#667eea',
           border: '2px solid #667eea',
           padding: '1rem',
           borderRadius: '12px',
           fontSize: '1rem',
           fontWeight: '500',
           cursor: 'pointer',
           transition: 'all 0.3s ease',
           width: '100%',
           minHeight: '48px',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }

  const errorStyles = {
    background: '#fed7d7',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #feb2b2',
    marginTop: '1rem',
    fontSize: '0.9rem'
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
               <div style={titleStyles}>
                 <img 
                   src="https://www.bna.dev.br/assets/bnadev_logo-Cb23hnmr.svg" 
                   alt="BNA Logo" 
                   style={logoImageStyles}
                   onMouseOver={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.05)'}
                   onMouseOut={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1)'}
                 />
               </div>
        <p style={subtitleStyles}>
          {isRegister ? 'Crie sua conta para começar' : 'Faça login para continuar'}
        </p>
        
        <form onSubmit={handleSubmit}>
          <input 
            style={inputStyles}
            placeholder="📧 Seu email" 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            required
          />
          <input 
            style={inputStyles}
            placeholder="🔒 Sua senha" 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            required
          />
          <button 
            type="submit" 
            style={{
              ...buttonStyles,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Processando...' : (isRegister ? '✨ Criar Conta' : '🔑 Entrar')}
          </button>
        </form>

        <button 
          type="button" 
          style={toggleButtonStyles}
          onClick={() => setIsRegister(v => !v)}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.background = '#667eea'
            ;(e.target as HTMLButtonElement).style.color = 'white'
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.background = 'transparent'
            ;(e.target as HTMLButtonElement).style.color = '#667eea'
          }}
        >
          {isRegister ? '👤 Já tenho uma conta' : '✨ Criar nova conta'}
        </button>

        {error && <div style={errorStyles}>❌ {error}</div>}
      </div>
    </div>
  )
}


