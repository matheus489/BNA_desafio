import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

type User = { id: number; email: string; role: string; created_at: string }

export function Admin() {
  const [users, setUsers] = useState<User[]>([])
  const [analyses, setAnalyses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [u, a] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/analyses`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setUsers(u.data)
      setAnalyses(a.data)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Erro ao carregar admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function changeRole(userId: number, role: string) {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${API}/admin/users/${userId}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } })
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Erro ao alterar role')
    }
  }

  // Estilos modernos
  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  }

  const cardStyles = {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid rgba(102, 126, 234, 0.1)'
  }

  const titleStyles = {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  }

  const sectionTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#2d3748',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  }

  const headerStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: '600',
    fontSize: '0.9rem'
  }

  const rowStyles = {
    borderBottom: '1px solid #f0f0f0',
    transition: 'all 0.3s ease'
  }

  const cellStyles = {
    padding: '1rem',
    verticalAlign: 'top' as const,
    color: '#2d3748'
  }

  const buttonStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '0.5rem',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
  }

  const userButtonStyles = {
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '0.5rem',
    boxShadow: '0 2px 4px rgba(72, 187, 120, 0.3)'
  }

  const adminButtonStyles = {
    background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '0.5rem',
    boxShadow: '0 2px 4px rgba(237, 137, 54, 0.3)'
  }

  const urlStyles = {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
    wordBreak: 'break-all' as const
  }

  const summaryStyles = {
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    color: '#4a5568'
  }

  const dateStyles = {
    color: '#6b7280',
    fontSize: '0.9rem'
  }

  const errorStyles = {
    background: '#fed7d7',
    color: '#c53030',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #feb2b2',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  }

  const loadingStyles = {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#6b7280',
    fontSize: '1.1rem'
  }

  const roleBadgeStyles = (role: string) => ({
    background: role === 'admin' 
      ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' 
      : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
    display: 'inline-block'
  })

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <div style={loadingStyles}>
            ⏳ Carregando painel administrativo...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h2 style={titleStyles}>
          ⚙️ Painel Administrativo
        </h2>
        
        {error && <div style={errorStyles}>❌ {error}</div>}
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={sectionTitleStyles}>
            👥 Usuários ({users.length})
          </h3>
          <div style={{ overflow: 'auto' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={headerStyles}>🆔 ID</th>
                  <th style={headerStyles}>📧 Email</th>
                  <th style={headerStyles}>👤 Role</th>
                  <th style={headerStyles}>⚙️ Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr 
                    key={u.id} 
                    style={rowStyles}
                    onMouseOver={(e) => (e.target as HTMLElement).style.background = '#f8f9fa'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.background = 'white'}
                  >
                    <td style={cellStyles}>{u.id}</td>
                    <td style={cellStyles}>
                      <div style={{ fontWeight: '500', color: '#2d3748' }}>
                        {u.email}
                      </div>
                    </td>
                    <td style={cellStyles}>
                      <span style={roleBadgeStyles(u.role)}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td style={cellStyles}>
                      <button 
                        style={userButtonStyles}
                        onClick={() => changeRole(u.id, 'user')}
                        onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
                      >
                        👤 User
                      </button>
                      <button 
                        style={adminButtonStyles}
                        onClick={() => changeRole(u.id, 'admin')}
                        onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
                      >
                        👑 Admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={sectionTitleStyles}>
            📊 Análises ({analyses.length})
          </h3>
          <div style={{ overflow: 'auto' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={headerStyles}>🆔 ID</th>
                  <th style={headerStyles}>🌐 URL</th>
                  <th style={headerStyles}>📄 Título</th>
                  <th style={headerStyles}>📝 Resumo</th>
                  <th style={headerStyles}>📅 Data</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((it: any) => (
                  <tr 
                    key={it.id}
                    style={rowStyles}
                    onMouseOver={(e) => (e.target as HTMLElement).style.background = '#f8f9fa'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.background = 'white'}
                  >
                    <td style={cellStyles}>{it.id}</td>
                    <td style={cellStyles}>
                      <a 
                        href={it.url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={urlStyles}
                      >
                        {it.url}
                      </a>
                    </td>
                    <td style={cellStyles}>
                      <div style={{ fontWeight: '500', color: '#2d3748' }}>
                        {it.title}
                      </div>
                    </td>
                    <td style={cellStyles}>
                      <div style={summaryStyles} title={it.summary}>
                        {it.summary}
                      </div>
                    </td>
                    <td style={cellStyles}>
                      <div style={dateStyles}>
                        {new Date(it.created_at).toLocaleString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


