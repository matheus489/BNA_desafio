import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

interface KanbanModalProps {
  card: any
  onClose: () => void
  onUpdate: () => void
}

interface Seller {
  id: number
  email: string
  role: string
}

interface Note {
  id: number
  content: string
  created_at: string
  user_email: string
}

interface Attachment {
  id: number
  filename: string
  file_url: string
  file_type: string | null
  file_size: number | null
  created_at: string
}

export function KanbanModal({ card, onClose, onUpdate }: KanbanModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'attachments'>('details')
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [newAttachment, setNewAttachment] = useState({ filename: '', url: '' })
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedSeller, setSelectedSeller] = useState<number | null>(null)
  const [loadingSellers, setLoadingSellers] = useState(false)

  useEffect(() => {
    loadDetails()
    loadSellers()
  }, [card.id])

  async function loadDetails() {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/kanban/analysis/${card.id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDetails(data)
      setSelectedSeller(data.seller_id || null)
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadSellers() {
    try {
      setLoadingSellers(true)
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/kanban/sellers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSellers(data)
    } catch (err) {
      console.error('Erro ao carregar vendedores:', err)
    } finally {
      setLoadingSellers(false)
    }
  }

  async function addNote() {
    if (!newNote.trim()) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API}/kanban/analysis/${card.id}/notes`,
        { content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewNote('')
      await loadDetails()
      onUpdate()
    } catch (err) {
      alert('Erro ao adicionar nota')
    }
  }

  async function deleteNote(noteId: number) {
    if (!confirm('Deletar esta nota?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API}/kanban/analysis/${card.id}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadDetails()
      onUpdate()
    } catch (err) {
      alert('Erro ao deletar nota')
    }
  }

  async function addAttachment() {
    if (!newAttachment.filename || !newAttachment.url) {
      alert('Preencha nome e URL do anexo')
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API}/kanban/analysis/${card.id}/attachments`,
        { filename: newAttachment.filename, file_url: newAttachment.url, file_type: 'link' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewAttachment({ filename: '', url: '' })
      await loadDetails()
      onUpdate()
    } catch (err) {
      alert('Erro ao adicionar anexo')
    }
  }

  async function deleteAttachment(attachmentId: number) {
    if (!confirm('Deletar este anexo?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API}/kanban/analysis/${card.id}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadDetails()
      onUpdate()
    } catch (err) {
      alert('Erro ao deletar anexo')
    }
  }

  async function assignSeller(sellerId: number) {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API}/kanban/analysis/${card.id}/assign-seller`,
        { seller_id: sellerId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedSeller(sellerId)
      await loadDetails()
      onUpdate()
    } catch (err) {
      alert('Erro ao atribuir vendedor')
    }
  }

  async function unassignSeller() {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${API}/kanban/analysis/${card.id}/unassign-seller`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedSeller(null)
      await loadDetails()
      onUpdate()
    } catch (err) {
      alert('Erro ao remover vendedor')
    }
  }

  if (loading) {
    return (
      <div style={overlayStyles} onClick={onClose}>
        <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '2rem' }}>⏳</div>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!details) return null

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyles}>
          <div style={{ flex: 1 }}>
            <h2 style={titleStyles}>{details.title || 'Sem título'}</h2>
            <a href={details.url} target="_blank" rel="noreferrer" style={linkStyles}>
              🔗 {details.url}
            </a>
          </div>
          <button style={closeButtonStyles} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={tabsStyles}>
          <button
            style={{...tabButtonStyles, ...(activeTab === 'details' ? activeTabStyles : {})}}
            onClick={() => setActiveTab('details')}
          >
            📄 Detalhes
          </button>
          <button
            style={{...tabButtonStyles, ...(activeTab === 'notes' ? activeTabStyles : {})}}
            onClick={() => setActiveTab('notes')}
          >
            📝 Notas ({details.notes?.length || 0})
          </button>
          <button
            style={{...tabButtonStyles, ...(activeTab === 'attachments' ? activeTabStyles : {})}}
            onClick={() => setActiveTab('attachments')}
          >
            📎 Anexos ({details.attachments?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div style={contentStyles}>
          {activeTab === 'details' && (
            <div>
              {details.summary && (
                <div style={sectionStyles}>
                  <h3 style={sectionTitleStyles}>📊 Resumo</h3>
                  <p style={textStyles}>{details.summary}</p>
                </div>
              )}

              {details.key_points && details.key_points.length > 0 && (
                <div style={sectionStyles}>
                  <h3 style={sectionTitleStyles}>🎯 Pontos-Chave</h3>
                  {details.key_points.map((point: string, idx: number) => (
                    <div key={idx} style={bulletStyles}>• {point}</div>
                  ))}
                </div>
              )}

              {details.entities && (
                <div style={sectionStyles}>
                  <h3 style={sectionTitleStyles}>🏢 Informações da Empresa</h3>
                  <div style={gridStyles}>
                    {details.entities.industry && (
                      <div style={infoBoxStyles}>
                        <strong>Indústria:</strong> {details.entities.industry}
                      </div>
                    )}
                    {details.entities.sales_potential && (
                      <div style={infoBoxStyles}>
                        <strong>Potencial:</strong> {details.entities.sales_potential}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seção de Vendedor */}
              <div style={sectionStyles}>
                <h3 style={sectionTitleStyles}>👤 Vendedor Responsável</h3>
                <div style={sellerSectionStyles}>
                  {selectedSeller ? (
                    <div style={sellerInfoStyles}>
                      <span style={sellerLabelStyles}>Vendedor atual:</span>
                      <span style={sellerEmailStyles}>
                        {sellers.find(s => s.id === selectedSeller)?.email || 'Carregando...'}
                      </span>
                      <button
                        style={unassignButtonStyles}
                        onClick={unassignSeller}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  ) : (
                    <div style={noSellerStyles}>
                      <span style={noSellerTextStyles}>Nenhum vendedor atribuído</span>
                    </div>
                  )}
                  
                  <div style={sellerSelectorStyles}>
                    <label style={sellerLabelStyles}>Atribuir vendedor:</label>
                    <select
                      style={sellerSelectStyles}
                      value={selectedSeller || ''}
                      onChange={(e) => {
                        const sellerId = parseInt(e.target.value)
                        if (sellerId) {
                          assignSeller(sellerId)
                        }
                      }}
                      disabled={loadingSellers}
                    >
                      <option value="">Selecione um vendedor...</option>
                      {sellers.map(seller => (
                        <option key={seller.id} value={seller.id}>
                          {seller.email} ({seller.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div style={addSectionStyles}>
                <textarea
                  style={textareaStyles}
                  placeholder="Adicionar nova nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <button style={addButtonStyles} onClick={addNote}>
                  ➕ Adicionar Nota
                </button>
              </div>

              <div style={notesListStyles}>
                {details.notes && details.notes.length > 0 ? (
                  details.notes.map((note: Note) => (
                    <div key={note.id} style={noteItemStyles}>
                      <div style={noteHeaderStyles}>
                        <span style={noteAuthorStyles}>{note.user_email}</span>
                        <span style={noteDateStyles}>
                          {new Date(note.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div style={noteContentStyles}>{note.content}</div>
                      <button
                        style={deleteButtonStyles}
                        onClick={() => deleteNote(note.id)}
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={emptyStyles}>Nenhuma nota ainda. Adicione a primeira!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              <div style={addSectionStyles}>
                <input
                  style={inputStyles}
                  placeholder="Nome do anexo"
                  value={newAttachment.filename}
                  onChange={(e) => setNewAttachment({...newAttachment, filename: e.target.value})}
                />
                <input
                  style={inputStyles}
                  placeholder="URL do anexo"
                  value={newAttachment.url}
                  onChange={(e) => setNewAttachment({...newAttachment, url: e.target.value})}
                />
                <button style={addButtonStyles} onClick={addAttachment}>
                  ➕ Adicionar Anexo
                </button>
              </div>

              <div style={attachmentsListStyles}>
                {details.attachments && details.attachments.length > 0 ? (
                  details.attachments.map((att: Attachment) => (
                    <div key={att.id} style={attachmentItemStyles}>
                      <div>
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noreferrer"
                          style={attachmentLinkStyles}
                        >
                          📄 {att.filename}
                        </a>
                        <div style={attachmentMetaStyles}>
                          {new Date(att.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <button
                        style={deleteButtonStyles}
                        onClick={() => deleteAttachment(att.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={emptyStyles}>Nenhum anexo ainda. Adicione o primeiro!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '2rem'
}

const modalStyles: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '900px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
}

const headerStyles: React.CSSProperties = {
  padding: '1.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start'
}

const titleStyles: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'white',
  margin: 0,
  marginBottom: '0.5rem'
}

const linkStyles: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
  fontSize: '0.9rem'
}

const closeButtonStyles: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.2)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  color: 'white',
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  fontSize: '1.2rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
}

const tabsStyles: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '0 1.5rem'
}

const tabButtonStyles: React.CSSProperties = {
  padding: '1rem 1.5rem',
  background: 'transparent',
  border: 'none',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'all 0.3s',
  borderBottom: '3px solid transparent',
  fontWeight: '500'
}

const activeTabStyles: React.CSSProperties = {
  color: '#667eea',
  borderBottom: '3px solid #667eea'
}

const contentStyles: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem'
}

const sectionStyles: React.CSSProperties = {
  marginBottom: '1.5rem'
}

const sectionTitleStyles: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: 'white',
  marginBottom: '0.75rem'
}

const textStyles: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: '1.6'
}

const bulletStyles: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.8)',
  padding: '0.5rem 0',
  lineHeight: '1.5'
}

const gridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem'
}

const infoBoxStyles: React.CSSProperties = {
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.9rem'
}

const addSectionStyles: React.CSSProperties = {
  marginBottom: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
}

const textareaStyles: React.CSSProperties = {
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  resize: 'vertical'
}

const inputStyles: React.CSSProperties = {
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.95rem'
}

const addButtonStyles: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  border: 'none',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'transform 0.2s'
}

const notesListStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
}

const noteItemStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '1rem',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}

const noteHeaderStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0.5rem'
}

const noteAuthorStyles: React.CSSProperties = {
  color: '#667eea',
  fontSize: '0.85rem',
  fontWeight: '600'
}

const noteDateStyles: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '0.8rem'
}

const noteContentStyles: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.9)',
  lineHeight: '1.5',
  marginBottom: '0.75rem',
  whiteSpace: 'pre-wrap'
}

const deleteButtonStyles: React.CSSProperties = {
  padding: '0.4rem 0.75rem',
  background: 'rgba(239, 68, 68, 0.2)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  borderRadius: '6px',
  color: 'white',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
}

const attachmentsListStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
}

const attachmentItemStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
}

const attachmentLinkStyles: React.CSSProperties = {
  color: '#667eea',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: '500'
}

const attachmentMetaStyles: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: '0.8rem',
  marginTop: '0.25rem'
}

const emptyStyles: React.CSSProperties = {
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.5)',
  padding: '2rem',
  fontSize: '0.95rem'
}

// Estilos para seção de vendedor
const sellerSectionStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
}

const sellerInfoStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  background: 'rgba(16, 185, 129, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(16, 185, 129, 0.3)'
}

const sellerSelectorStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
}

const sellerLabelStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.8)'
}

const sellerEmailStyles: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#10b981',
  fontWeight: '500'
}

const sellerSelectStyles: React.CSSProperties = {
  padding: '0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.95rem',
  cursor: 'pointer'
}

const unassignButtonStyles: React.CSSProperties = {
  padding: '0.5rem 1rem',
  background: 'rgba(239, 68, 68, 0.2)',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  borderRadius: '6px',
  color: 'white',
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.2s'
}

const noSellerStyles: React.CSSProperties = {
  padding: '1rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  textAlign: 'center'
}

const noSellerTextStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.6)',
  fontStyle: 'italic'
}

