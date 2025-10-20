import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { KanbanModal } from '../components/kanban/KanbanModal'

const API = 'http://localhost:8000'

const STAGES = {
  lead: { label: 'Lead', color: '#667eea', icon: '🎯' },
  qualified: { label: 'Qualificado', color: '#4facfe', icon: '✅' },
  proposal: { label: 'Proposta', color: '#f093fb', icon: '📄' },
  negotiation: { label: 'Negociação', color: '#43e97b', icon: '🤝' },
  closed: { label: 'Fechado', color: '#10b981', icon: '🎉' },
}

interface Card {
  id: number
  title: string
  url: string
  stage: string
  created_at: string
  summary: string | null
  sales_potential: string
  industry: string
  has_enrichment: boolean
}

interface PipelineData {
  pipeline: {
    [key: string]: Card[]
  }
  stats: {
    total: number
    by_stage: { [key: string]: number }
  }
}

export function Kanban() {
  const [pipeline, setPipeline] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [suggestions, setSuggestions] = useState<{ [key: number]: string[] }>({})
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    loadPipeline()
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadPipeline, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadPipeline() {
    try {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')
      
      // Se for vendedor, carrega apenas seus cards
      const endpoint = (role === 'seller' || role === 'user') ? '/kanban/my-pipeline' : '/kanban/pipeline'
      
      const { data } = await axios.get<PipelineData>(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPipeline(data)
    } catch (err) {
      console.error('Erro ao carregar pipeline:', err)
      alert('Erro ao carregar pipeline')
    } finally {
      setLoading(false)
    }
  }

  async function loadSuggestions(cardId: number) {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get<{ suggestions: string[] }>(
        `${API}/kanban/analysis/${cardId}/suggestions`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSuggestions((prev) => ({ ...prev, [cardId]: data.suggestions }))
    } catch (err) {
      console.error('Erro ao carregar sugestões:', err)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const card = findCard(active.id as number)
    setActiveCard(card)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)

    if (!over || !pipeline) return

    const cardId = active.id as number
    const newStage = over.id as string

    // Encontra stage atual
    const currentStage = Object.keys(pipeline.pipeline).find((stage) =>
      pipeline.pipeline[stage].some((card) => card.id === cardId)
    )

    if (currentStage === newStage) return

    // Update otimista na UI
    const updatedPipeline = { ...pipeline.pipeline }
    const card = findCard(cardId)

    if (!card || !currentStage) return

    // Remove do stage antigo
    updatedPipeline[currentStage] = updatedPipeline[currentStage].filter(
      (c) => c.id !== cardId
    )

    // Adiciona no novo stage
    card.stage = newStage
    updatedPipeline[newStage] = [...updatedPipeline[newStage], card]

    // Atualiza stats
    const newStats = {
      ...pipeline.stats,
      by_stage: {
        ...pipeline.stats.by_stage,
        [currentStage]: (pipeline.stats.by_stage[currentStage] || 0) - 1,
        [newStage]: (pipeline.stats.by_stage[newStage] || 0) + 1
      }
    }

    setPipeline({
      ...pipeline,
      pipeline: updatedPipeline,
      stats: newStats
    })

    // Atualiza no backend
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.patch(
        `${API}/kanban/analysis/${cardId}/stage`,
        { stage: newStage },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Carrega sugestões para o novo estágio
      if (data.suggestion) {
        setSuggestions((prev) => ({ ...prev, [cardId]: data.suggestion }))
      }

      // Mostra notificação
      showNotification(`Movido para ${STAGES[newStage as keyof typeof STAGES].label}!`)
    } catch (err) {
      console.error('Erro ao mover card:', err)
      // Reverte mudança
      loadPipeline()
    }
  }

  function findCard(id: number): Card | null {
    if (!pipeline) return null

    for (const stage of Object.keys(pipeline.pipeline)) {
      const card = pipeline.pipeline[stage].find((c) => c.id === id)
      if (card) return card
    }
    return null
  }

  function showNotification(message: string) {
    // Implementação simples - você pode usar um toast library
    const notification = document.createElement('div')
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
  }

  async function handleCardClick(card: Card) {
    setSelectedCard(card)
  }

  if (loading) {
    return (
      <div style={loadingContainerStyles}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p>Carregando pipeline...</p>
      </div>
    )
  }

  if (!pipeline) {
    return (
      <div style={loadingContainerStyles}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <p>Erro ao carregar pipeline</p>
        <button style={retryButtonStyles} onClick={loadPipeline}>
          🔄 Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>📋 Pipeline de Vendas</h1>
          <p style={subtitleStyles}>
            Arraste e solte para mover leads entre estágios
          </p>
        </div>
        <div style={statsContainerStyles}>
          <div style={statItemStyles}>
            <span style={statLabelStyles}>Total:</span>
            <span style={statValueStyles}>{pipeline.stats.total}</span>
          </div>
          <div style={autoRefreshIndicatorStyles}>
            🔄 Auto-atualização ativa
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={boardStyles}>
          {Object.entries(STAGES).map(([stageKey, stageInfo]) => (
            <Column
              key={stageKey}
              stage={stageKey}
              stageInfo={stageInfo}
              cards={pipeline.pipeline[stageKey] || []}
              count={pipeline.stats.by_stage[stageKey] || 0}
              onCardClick={handleCardClick}
              showSuggestions={showSuggestions}
              suggestions={suggestions}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? <CardItem card={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modal Detalhado */}
      {selectedCard && (
        <KanbanModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={loadPipeline}
        />
      )}
    </div>
  )
}

// Column Component
function Column({
  stage,
  stageInfo,
  cards,
  count,
  onCardClick,
  showSuggestions,
  suggestions,
}: any) {
  const { setNodeRef } = useSortable({ id: stage })

  return (
    <div ref={setNodeRef} style={columnStyles}>
      <div style={{ ...columnHeaderStyles, borderTopColor: stageInfo.color }}>
        <div style={columnTitleContainerStyles}>
          <span style={{ fontSize: '1.5rem' }}>{stageInfo.icon}</span>
          <h3 style={columnTitleStyles}>{stageInfo.label}</h3>
          <span style={columnCountStyles}>{count}</span>
        </div>
      </div>

      <div style={columnContentStyles}>
        <SortableContext items={cards.map((c: Card) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <div style={emptyStateStyles}>
              <p>Nenhum lead neste estágio</p>
              <div style={columnDropZoneStyles}>
                <span>Solte cards aqui</span>
              </div>
            </div>
          ) : (
            <>
              {cards.map((card: Card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  onClick={() => onCardClick(card)}
                  showSuggestions={showSuggestions === card.id}
                  suggestions={suggestions[card.id]}
                />
              ))}
              <div style={columnDropZoneStyles}>
                <span>+ Solte novos cards aqui</span>
              </div>
            </>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// Card Component
function CardItem({ card, isDragging, onClick, showSuggestions, suggestions }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const potentialColor =
    card.sales_potential === 'Alto'
      ? '#43e97b'
      : card.sales_potential === 'Médio'
      ? '#4facfe'
      : '#f093fb'

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          ...(isSortableDragging ? cardDraggingStyles : cardStyles),
          cursor: isSortableDragging ? 'grabbing' : 'grab',
          transform: isDragging ? 'rotate(3deg)' : 'none',
        }}
        onClick={onClick}
      >
        <div style={cardHeaderRowStyles}>
          <h4 style={cardTitleStyles}>{card.title}</h4>
          {card.has_enrichment && <span style={enrichmentBadgeStyles}>360°</span>}
        </div>

        {card.summary && (
          <p style={cardSummaryStyles}>{card.summary.substring(0, 100)}...</p>
        )}

        <div style={cardMetaRowStyles}>
          <span style={cardMetaItemStyles}>
            🏢 {card.industry || 'N/A'}
          </span>
          <span
            style={{
              ...cardMetaItemStyles,
              ...potentialBadgeStyles,
              background: potentialColor + '20',
              color: potentialColor,
              border: `1px solid ${potentialColor}40`,
            }}
          >
            {card.sales_potential}
          </span>
        </div>

        <div style={cardFooterStyles}>
          <span style={cardDateStyles}>
            {new Date(card.created_at).toLocaleDateString('pt-BR')}
          </span>
          <a
            href={card.url}
            target="_blank"
            rel="noreferrer"
            style={cardLinkStyles}
            onClick={(e) => e.stopPropagation()}
          >
            🔗 Ver site
          </a>
        </div>

        {/* Sugestões de IA */}
        {showSuggestions && suggestions && (
          <div style={suggestionsContainerStyles}>
            <div style={suggestionsHeaderStyles}>
              <span>🤖 Próximas Ações Sugeridas:</span>
            </div>
            {suggestions.map((suggestion: string, idx: number) => (
              <div key={idx} style={suggestionItemStyles}>
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Styles
const containerStyles: React.CSSProperties = {
  padding: '2rem 3rem',
  maxWidth: '1800px',
  margin: '0 auto',
  minHeight: '100vh',
}

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem',
}

const titleStyles: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: 'white',
  margin: 0,
  marginBottom: '0.5rem',
}

const subtitleStyles: React.CSSProperties = {
  fontSize: '1rem',
  color: 'rgba(255, 255, 255, 0.6)',
  margin: 0,
}

const statsContainerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
}

const statItemStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}

const statLabelStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.7)',
}

const statValueStyles: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#667eea',
}

const autoRefreshIndicatorStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  background: 'rgba(67, 233, 123, 0.1)',
  borderRadius: '12px',
  border: '1px solid rgba(67, 233, 123, 0.3)',
  color: 'rgba(67, 233, 123, 0.9)',
  fontSize: '0.9rem',
  fontWeight: '600',
}

const boardStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1rem',
  alignItems: 'flex-start',
  padding: '0.5rem',
  minHeight: 'calc(100vh - 200px)',
  overflowX: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
}

const columnStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  minHeight: 'calc(100vh - 250px)',
  maxHeight: 'calc(100vh - 200px)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  position: 'relative',
}

const columnHeaderStyles: React.CSSProperties = {
  padding: '1.25rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
}

const columnTitleContainerStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

const columnTitleStyles: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: '600',
  color: 'white',
  margin: 0,
  flex: 1,
}

const columnCountStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  padding: '0.25rem 0.75rem',
  borderRadius: '20px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: 'white',
}

const columnContentStyles: React.CSSProperties = {
  padding: '0.75rem',
  flex: 1,
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 300px)',
  minHeight: '200px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
}

const emptyStateStyles: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: '0.9rem',
}

const cardStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1rem',
  marginBottom: '0.75rem',
  transition: 'all 0.2s',
  cursor: 'grab',
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
}

const cardDraggingStyles: React.CSSProperties = {
  ...cardStyles,
  cursor: 'grabbing',
  transform: 'rotate(5deg)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  border: '2px solid rgba(67, 233, 123, 0.6)',
  background: 'rgba(67, 233, 123, 0.1)',
}

const columnDropZoneStyles: React.CSSProperties = {
  minHeight: '100px',
  border: '2px dashed rgba(67, 233, 123, 0.4)',
  borderRadius: '12px',
  background: 'rgba(67, 233, 123, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(67, 233, 123, 0.8)',
  fontSize: '0.9rem',
  fontWeight: '500',
  margin: '0.5rem 0',
  transition: 'all 0.2s ease',
}

const cardHeaderRowStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.75rem',
}

const cardTitleStyles: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'white',
  margin: 0,
  flex: 1,
}

const enrichmentBadgeStyles: React.CSSProperties = {
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  padding: '0.25rem 0.5rem',
  borderRadius: '6px',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: 'white',
}

const cardSummaryStyles: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: '1.4',
  marginBottom: '0.75rem',
}

const cardMetaRowStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '0.75rem',
  flexWrap: 'wrap',
}

const cardMetaItemStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.6)',
}

const potentialBadgeStyles: React.CSSProperties = {
  padding: '0.25rem 0.5rem',
  borderRadius: '6px',
  fontWeight: '600',
}

const cardFooterStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '0.75rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}

const cardDateStyles: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.5)',
}

const cardLinkStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: '500',
}

const suggestionsContainerStyles: React.CSSProperties = {
  marginTop: '1rem',
  padding: '0.75rem',
  background: 'rgba(102, 126, 234, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(102, 126, 234, 0.3)',
}

const suggestionsHeaderStyles: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: '#667eea',
  marginBottom: '0.5rem',
}

const suggestionItemStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.8)',
  padding: '0.5rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '6px',
  marginBottom: '0.25rem',
}

const loadingContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '1.2rem',
}

const retryButtonStyles: React.CSSProperties = {
  marginTop: '1.5rem',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  border: 'none',
  color: 'white',
  padding: '0.75rem 2rem',
  borderRadius: '12px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: '600',
}

