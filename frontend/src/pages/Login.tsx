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
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'transparent'
  }

  const cardStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(30px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
    padding: '3.5rem',
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center' as const,
    color: 'white'
  }

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const logoImageStyles = {
    height: '90px',
    width: 'auto',
    filter: 'brightness(0) invert(1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '1rem'
  }

  const subtitleStyles = {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '2.5rem',
    fontSize: '1.05rem',
    lineHeight: '1.6'
  }

  const inputStyles = {
    width: '100%',
    padding: '1.25rem',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '14px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    marginBottom: '1rem',
    minHeight: '52px',
    boxSizing: 'border-box' as const
  }

  const buttonStyles = {
    width: '100%',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    color: 'white',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    padding: '1.25rem',
    borderRadius: '14px',
    fontSize: '1.05rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
    marginBottom: '1rem',
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)'
  }

  const toggleButtonStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '1.25rem',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%',
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)'
  }

  const errorStyles = {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: 'rgba(254, 202, 202, 1)',
    padding: '1.25rem',
    borderRadius: '12px',
    marginTop: '1.25rem',
    fontSize: '0.95rem',
    backdropFilter: 'blur(10px)'
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={titleStyles}>
          <img 
            src="https://www.bna.dev.br/assets/bnadev_logo-Cb23hnmr.svg" 
            alt="BNA Logo" 
            style={logoImageStyles}
            onMouseOver={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1.08) rotate(2deg)'}
            onMouseOut={(e) => (e.target as HTMLImageElement).style.transform = 'scale(1) rotate(0deg)'}
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
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.6)'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
              e.target.style.boxShadow = 'none'
            }}
            required
          />
          <input 
            style={inputStyles}
            placeholder="🔒 Sua senha" 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(102, 126, 234, 0.6)'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'
              e.target.style.boxShadow = 'none'
            }}
            required
          />
          <button 
            type="submit" 
            style={{
              ...buttonStyles,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.transform = 'translateY(-3px)')}
            onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Processando...' : (isRegister ? '✨ Criar Conta' : '🔑 Entrar')}
          </button>
        </form>

        <button 
          type="button" 
          style={toggleButtonStyles}
          onClick={() => setIsRegister(v => !v)}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(102, 126, 234, 0.2)'
            ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(102, 126, 234, 0.4)'
            ;(e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.05)'
            ;(e.target as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.15)'
            ;(e.target as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          {isRegister ? '👤 Já tenho uma conta' : '✨ Criar nova conta'}
        </button>

        {error && <div style={errorStyles}>❌ {error}</div>}
      </div>

      <style>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}
