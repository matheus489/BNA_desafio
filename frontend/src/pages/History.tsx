import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export function History() {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(`${API}/history`, { headers: { Authorization: `Bearer ${token}` } })
        setItems(data)
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Erro ao carregar histórico')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function exportToGoogleSheets() {
    if (exporting) return
    
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      
      // Baixa o CSV do backend
      const response = await axios.get(`${API}/history/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      // Cria um Blob com o CSV
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
      
      // Cria URL temporária
      const url = window.URL.createObjectURL(blob)
      
      // Baixa o arquivo
      const link = document.createElement('a')
      link.href = url
      link.download = `analises_bna_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // Aguarda um momento e abre o Google Sheets
      setTimeout(() => {
        // Abre Google Sheets direto na página de "Abrir arquivo"
        const sheetsUrl = 'https://docs.google.com/spreadsheets/u/0/'
        const newWindow = window.open(sheetsUrl, '_blank')
        
        if (newWindow) {
          // Aguarda a página carregar e tenta abrir o modal automaticamente
          setTimeout(() => {
            try {
              // Tenta clicar no botão "Abrir um arquivo" via JavaScript
              newWindow.postMessage({
                type: 'OPEN_FILE_DIALOG',
                action: 'click'
              }, '*')
            } catch (e) {
              console.log('Não foi possível abrir o modal automaticamente')
            }
          }, 2000)
          
          // Mostra mensagem de sucesso
          alert('✅ CSV baixado com sucesso!\n\n' +
                '📊 O Google Sheets foi aberto na página de arquivos.\n\n' +
                'Para importar:\n' +
                '1. Clique em "Abrir um arquivo" (modal deve abrir)\n' +
                '2. Selecione o arquivo "analises_bna_..." na lista\n' +
                '3. O arquivo será importado automaticamente\n\n' +
                '✨ Pronto! Seus dados estarão formatados e prontos para uso!')
        } else {
          alert('✅ CSV baixado com sucesso!\n\n' +
                '⚠️ Não foi possível abrir o Google Sheets automaticamente.\n' +
                'Por favor, abra manualmente: sheets.google.com')
        }
      }, 1000)
      
    } catch (err: any) {
      console.error('Erro ao exportar:', err)
      alert('❌ Erro ao exportar dados.\n' + 
            (err?.response?.data?.detail || 'Tente novamente.'))
    } finally {
      setExporting(false)
    }
  }

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
    marginBottom: '2rem'
  }

  const titleStyles = {
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    marginBottom: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    textShadow: '0 2px 10px rgba(102, 126, 234, 0.5)'
  }

  const exportButtonStyles = {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.8) 100%)',
    color: 'white',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    padding: '0.875rem 1.75rem',
    borderRadius: '14px',
    fontSize: '0.95rem',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    backdropFilter: 'blur(10px)'
  }

  const emptyStateStyles = {
    textAlign: 'center' as const,
    padding: '4rem',
    color: 'rgba(255, 255, 255, 0.6)'
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
    backdropFilter: 'blur(10px)'
  }

  const loadingStyles = {
    textAlign: 'center' as const,
    padding: '4rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.2rem'
  }

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <div style={loadingStyles}>
            ⏳ Carregando histórico...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={titleStyles}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem' }}>
            📋 Histórico de Análises
          </h2>
          {items.length > 0 && (
            <button
              style={{
                ...exportButtonStyles,
                opacity: exporting ? 0.5 : 1,
                cursor: exporting ? 'not-allowed' : 'pointer'
              }}
              onClick={exportToGoogleSheets}
              disabled={exporting}
              onMouseOver={(e) => !exporting && (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {exporting ? (
                <>
                  ⏳ Exportando...
                </>
              ) : (
                <>
                  📊 Exportar para Google Sheets
                </>
              )}
            </button>
          )}
        </div>
        
        {error && <div style={errorStyles}>❌ {error}</div>}
        
        {items.length === 0 ? (
          <div style={emptyStateStyles}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'grayscale(0.3)' }}>📊</div>
            <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem', fontSize: '1.8rem' }}>Nenhuma análise encontrada</h3>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Comece analisando URLs na página "Analisar" para ver seu histórico aqui.
            </p>
          </div>
        ) : (
          <div style={{ overflow: 'auto', marginTop: '2rem' }}>
            <table style={tableStyles}>
              <thead>
                <tr>
                  <th style={headerStyles}>🌐 URL</th>
                  <th style={headerStyles}>📄 Título</th>
                  <th style={headerStyles}>📝 Resumo</th>
                  <th style={headerStyles}>📅 Data</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr 
                    key={item.id} 
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
                    <td style={cellStyles}>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={urlStyles}
                        onMouseOver={(e) => (e.target as HTMLAnchorElement).style.color = 'rgba(118, 75, 162, 1)'}
                        onMouseOut={(e) => (e.target as HTMLAnchorElement).style.color = 'rgba(102, 126, 234, 1)'}
                      >
                        {item.url}
                      </a>
                    </td>
                    <td style={cellStyles}>
                      <div style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.95)' }}>
                        {item.title}
                      </div>
                    </td>
                    <td style={cellStyles}>
                      <div style={summaryStyles} title={item.summary}>
                        {item.summary}
                      </div>
                    </td>
                    <td style={cellStyles}>
                      <div style={dateStyles}>
                        {new Date(item.created_at).toLocaleString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
