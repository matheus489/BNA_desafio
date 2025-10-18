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
    width: '100%',
    minHeight: 'calc(100vh - 100px)',
    padding: '3rem',
    color: 'white'
  }

  const cardStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '2.5rem',
    marginBottom: '2.5rem'
  }

  const titleStyles = {
    fontSize: '2.5rem',
    fontWeight: 'bold' as const,
    marginBottom: '2rem',
    color: 'white',
    textShadow: '0 2px 10px rgba(102, 126, 234, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  }

  const sectionTitleStyles = {
    fontSize: '1.6rem',
    fontWeight: '600' as const,
    marginBottom: '1.5rem',
    color: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  }

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  }

  const headerStyles = {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '1.25rem',
    textAlign: 'left' as const,
    fontWeight: '600' as const,
    fontSize: '0.95rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  }

  const rowStyles = {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  const cellStyles = {
    padding: '1.25rem',
    verticalAlign: 'middle' as const,
    color: 'rgba(255, 255, 255, 0.9)'
  }

  const buttonStyles = {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)',
    color: 'white',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginRight: '0.75rem',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    backdropFilter: 'blur(10px)'
  }

  const userButtonStyles = {
    background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.6) 0%, rgba(56, 161, 105, 0.6) 100%)',
    color: 'white',
    border: '1px solid rgba(72, 187, 120, 0.3)',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginRight: '0.75rem',
    boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
    backdropFilter: 'blur(10px)'
  }

  const adminButtonStyles = {
    background: 'linear-gradient(135deg, rgba(237, 137, 54, 0.6) 0%, rgba(221, 107, 32, 0.6) 100%)',
    color: 'white',
    border: '1px solid rgba(237, 137, 54, 0.3)',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginRight: '0.75rem',
    boxShadow: '0 4px 15px rgba(237, 137, 54, 0.3)',
    backdropFilter: 'blur(10px)'
  }

  const urlStyles = {
    color: 'rgba(102, 126, 234, 1)',
    textDecoration: 'none',
    fontWeight: '500' as const,
    wordBreak: 'break-all' as const,
    transition: 'color 0.3s ease'
  }

  const summaryStyles = {
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    color: 'rgba(255, 255, 255, 0.7)'
  }

  const dateStyles = {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem'
  }

  const errorStyles = {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: 'rgba(254, 202, 202, 1)',
    padding: '1.25rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    backdropFilter: 'blur(10px)'
  }

  const loadingStyles = {
    textAlign: 'center' as const,
    padding: '4rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.2rem'
  }

  const roleBadgeStyles = (role: string) => ({
    background: role === 'admin' 
      ? 'linear-gradient(135deg, rgba(237, 137, 54, 0.8) 0%, rgba(221, 107, 32, 0.8) 100%)' 
      : 'linear-gradient(135deg, rgba(72, 187, 120, 0.8) 0%, rgba(56, 161, 105, 0.8) 100%)',
    color: 'white',
    padding: '0.375rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500' as const,
    display: 'inline-block',
    border: `1px solid ${role === 'admin' ? 'rgba(237, 137, 54, 0.3)' : 'rgba(72, 187, 120, 0.3)'}`,
    backdropFilter: 'blur(10px)'
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
        
        <div style={{ marginBottom: '3rem' }}>
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
                    onMouseOver={(e) => {
                      const row = e.currentTarget
                      row.style.background = 'rgba(102, 126, 234, 0.1)'
                    }}
                    onMouseOut={(e) => {
                      const row = e.currentTarget
                      row.style.background = 'transparent'
                    }}
                  >
                    <td style={cellStyles}>{u.id}</td>
                    <td style={cellStyles}>
                      <div style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.95)' }}>
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
                        onMouseOver={(e) => {
                          (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                          ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.5)'
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                          ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)'
                        }}
                      >
                        👤 User
                      </button>
                      <button 
                        style={adminButtonStyles}
                        onClick={() => changeRole(u.id, 'admin')}
                        onMouseOver={(e) => {
                          (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
                          ;(e.target as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(237, 137, 54, 0.5)'
                        }}
                        onMouseOut={(e) => {
                          (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
                          ;(e.target as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(237, 137, 54, 0.3)'
                        }}
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
                    onMouseOver={(e) => {
                      const row = e.currentTarget
                      row.style.background = 'rgba(102, 126, 234, 0.1)'
                    }}
                    onMouseOut={(e) => {
                      const row = e.currentTarget
                      row.style.background = 'transparent'
                    }}
                  >
                    <td style={cellStyles}>{it.id}</td>
                    <td style={cellStyles}>
                      <a 
                        href={it.url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={urlStyles}
                        onMouseOver={(e) => (e.target as HTMLAnchorElement).style.color = 'rgba(118, 75, 162, 1)'}
                        onMouseOut={(e) => (e.target as HTMLAnchorElement).style.color = 'rgba(102, 126, 234, 1)'}
                      >
                        {it.url}
                      </a>
                    </td>
                    <td style={cellStyles}>
                      <div style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.95)' }}>
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

      <style>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
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
