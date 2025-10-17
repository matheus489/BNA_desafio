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
    maxWidth: '1200px',
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

  const titleStyles = {
    color: '#2d3748',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const
  }

  const exportButtonStyles = {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }

  const emptyStateStyles = {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#6b7280'
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
    fontWeight: '600'
  }

  const rowStyles = {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease'
  }

  const cellStyles = {
    padding: '1rem',
    verticalAlign: 'top' as const
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
    borderRadius: '8px',
    border: '1px solid #feb2b2',
    marginBottom: '1rem'
  }

  const loadingStyles = {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#6b7280',
    fontSize: '1.1rem'
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
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Histórico de Análises
          </h2>
          {items.length > 0 && (
            <button
              style={{
                ...exportButtonStyles,
                opacity: exporting ? 0.6 : 1,
                cursor: exporting ? 'not-allowed' : 'pointer'
              }}
              onClick={exportToGoogleSheets}
              disabled={exporting}
              onMouseOver={(e) => !exporting && (e.currentTarget.style.transform = 'translateY(-2px)')}
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>Nenhuma análise encontrada</h3>
            <p>Comece analisando URLs na página "Analisar" para ver seu histórico aqui.</p>
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
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
                {items.map((item, index) => (
                  <tr 
                    key={item.id} 
                    style={rowStyles}
                    onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                  >
                    <td style={cellStyles}>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={urlStyles}
                      >
                        {item.url}
                      </a>
                    </td>
                    <td style={cellStyles}>
                      <div style={{ fontWeight: '500', color: '#2d3748' }}>
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
    </div>
  )
}


