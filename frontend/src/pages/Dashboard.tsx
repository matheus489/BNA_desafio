import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const API = 'http://localhost:8000'

interface DashboardData {
  kpis: {
    total_leads: number
    total_leads_trend: string
    hot_leads: number
    hot_leads_trend: string
    analyses_this_month: number
    analyses_trend: string
    avg_deal_score: number
    deal_score_trend: string
  }
  ai_insights: Array<{
    type: 'opportunity' | 'risk' | 'info'
    icon: string
    title: string
    description: string
  }>
  pipeline_distribution: Array<{
    stage: string
    count: number
  }>
  recent_activity: Array<{
    id: string
    timestamp: string
    type: string
    icon: string
    description: string
    user: string
  }>
  trends: {
    weekly_analyses: Array<{
      week: string
      count: number
      date_range: string
    }>
  }
  top_leads: Array<{
    company: string
    deal_score: number
    reason: string
    url: string
    analysis_id: number
  }>
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
    // Auto-refresh a cada 2 minutos
    const interval = setInterval(loadDashboard, 120000)
    return () => clearInterval(interval)
  }, [])

  async function loadDashboard() {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(response.data)
      setError('')
    } catch (err: any) {
      console.error('Erro ao carregar dashboard:', err)
      setError(err?.response?.data?.detail || 'Erro ao carregar dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={loadingStyles}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          Carregando dashboard...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={errorStyles}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.9)' }}>
          {error}
        </p>
        <button style={retryButtonStyles} onClick={loadDashboard}>
          🔄 Tentar Novamente
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>
            📊 Dashboard Executivo
          </h1>
          <p style={subtitleStyles}>
            Visão consolidada com insights de IA em tempo real
          </p>
        </div>
        <button style={refreshButtonStyles} onClick={loadDashboard}>
          🔄 Atualizar
        </button>
      </div>

      {/* KPIs Grid */}
      <div style={kpiGridStyles}>
        <KPICard
          title="Total de Leads"
          value={data.kpis.total_leads}
          icon="📊"
          trend={data.kpis.total_leads_trend}
          color="#667eea"
        />
        <KPICard
          title="Leads Quentes"
          value={data.kpis.hot_leads}
          icon="🔥"
          trend={data.kpis.hot_leads_trend}
          color="#f093fb"
        />
        <KPICard
          title="Análises (mês)"
          value={data.kpis.analyses_this_month}
          icon="📈"
          trend={data.kpis.analyses_trend}
          color="#43e97b"
        />
        <KPICard
          title="Deal Score Médio"
          value={data.kpis.avg_deal_score}
          icon="⭐"
          trend={data.kpis.deal_score_trend}
          color="#4facfe"
        />
      </div>

      {/* Main Content Grid */}
      <div style={mainGridStyles}>
        {/* AI Insights */}
        <div style={cardStyles}>
          <h2 style={cardTitleStyles}>🤖 Insights de IA</h2>
          <div style={insightsContainerStyles}>
            {data.ai_insights.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>

        {/* Pipeline Distribution */}
        <div style={cardStyles}>
          <h2 style={cardTitleStyles}>📊 Distribuição do Pipeline</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.pipeline_distribution}
                dataKey="count"
                nameKey="stage"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.stage}: ${entry.count}`}
                labelStyle={{ fontSize: '0.75rem' }}
              >
                {data.pipeline_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '0.85rem' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trends */}
        <div style={cardStyles}>
          <h2 style={cardTitleStyles}>📈 Tendência Semanal</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.trends.weekly_analyses}>
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '0.8rem' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '0.8rem' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#667eea"
                strokeWidth={2.5}
                dot={{ fill: '#667eea', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity - Full Width */}
        <div style={{ ...cardStyles, gridColumn: '1 / -1' }}>
          <h2 style={cardTitleStyles}>📋 Atividade Recente</h2>
          <div style={activityTimelineStyles}>
            {data.recent_activity.slice(0, 15).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Subcomponents
function KPICard({ title, value, icon, trend, color }: any) {
  const isPositive = trend.startsWith('+')

  return (
    <div style={{...kpiCardStyles, borderLeft: `4px solid ${color}`}}>
      <div style={kpiIconContainerStyles}>
        <span style={{...kpiIconStyles, color}}>{icon}</span>
      </div>
      <div style={kpiContentStyles}>
        <p style={kpiTitleTextStyles}>{title}</p>
        <p style={kpiValueStyles}>{value}</p>
        <span style={{
          ...kpiTrendStyles,
          color: isPositive ? '#43e97b' : '#f093fb'
        }}>
          {trend} {isPositive ? '↑' : '↓'}
        </span>
      </div>
    </div>
  )
}

function InsightCard({ insight }: any) {
  const bgColor = {
    opportunity: 'rgba(16, 185, 129, 0.1)',
    risk: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(102, 126, 234, 0.1)'
  }[insight.type]

  const borderColor = {
    opportunity: '#10b981',
    risk: '#ef4444',
    info: '#667eea'
  }[insight.type]

  return (
    <div
      style={{
        ...insightCardStyles,
        background: bgColor,
        borderLeft: `3px solid ${borderColor}`
      }}
    >
      <div style={insightHeaderStyles}>
        <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
        <h3 style={insightTitleTextStyles}>{insight.title}</h3>
      </div>
      <p style={insightDescriptionStyles}>{insight.description}</p>
    </div>
  )
}

function TopLeadCard({ lead, rank }: any) {
  const scoreColor = lead.deal_score >= 80 ? '#43e97b' : lead.deal_score >= 60 ? '#4facfe' : '#f093fb'

  return (
    <div style={topLeadCardStyles}>
      <div style={topLeadRankStyles}>#{rank}</div>
      <div style={topLeadContentStyles}>
        <h4 style={topLeadCompanyStyles}>{lead.company}</h4>
        <p style={topLeadReasonStyles}>{lead.reason}</p>
        <div style={topLeadScoreStyles}>
          <div style={topLeadScoreBarBgStyles}>
            <div
              style={{
                ...topLeadScoreBarFillStyles,
                width: `${lead.deal_score}%`,
                background: scoreColor
              }}
            />
          </div>
          <span style={{...topLeadScoreTextStyles, color: scoreColor}}>
            {lead.deal_score}/100
          </span>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ activity }: any) {
  const timeAgo = getTimeAgo(new Date(activity.timestamp))

  return (
    <div style={activityItemStyles}>
      <div style={activityDotStyles} />
      <div style={activityContentContainerStyles}>
        <div style={activityHeaderRowStyles}>
          <span style={activityIconStyles}>{activity.icon}</span>
          <p style={activityDescriptionStyles}>{activity.description}</p>
        </div>
        <p style={activityMetaStyles}>{timeAgo}</p>
      </div>
    </div>
  )
}


// Utility function
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `Há ${days} dia${days > 1 ? 's' : ''}`
  if (hours > 0) return `Há ${hours} hora${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
  return 'Agora mesmo'
}

// Styles
const containerStyles: React.CSSProperties = {
  padding: '1.5rem 2rem',
  maxWidth: '1600px',
  margin: '0 auto',
  minHeight: '100vh'
}

const headerStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
  padding: '0'
}

const titleStyles: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: 'white',
  margin: 0,
  marginBottom: '0.25rem'
}

const subtitleStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.6)',
  margin: 0
}

const refreshButtonStyles: React.CSSProperties = {
  background: 'rgba(102, 126, 234, 0.2)',
  border: '1px solid rgba(102, 126, 234, 0.4)',
  color: 'white',
  padding: '0.6rem 1.25rem',
  borderRadius: '10px',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.3s',
  fontWeight: '600'
}

const kpiGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem'
}

const kpiCardStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer'
}

const kpiIconContainerStyles: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const kpiIconStyles: React.CSSProperties = {
  fontSize: '1.5rem'
}

const kpiContentStyles: React.CSSProperties = {
  flex: 1
}

const kpiTitleTextStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.7)',
  margin: 0,
  marginBottom: '0.3rem'
}

const kpiValueStyles: React.CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: 'bold',
  color: 'white',
  margin: 0,
  marginBottom: '0.2rem'
}

const kpiTrendStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: '600'
}

const mainGridStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
  gap: '1rem'
}

const cardStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1.25rem',
  minHeight: '320px'
}

const cardTitleStyles: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: 'white',
  marginBottom: '1rem'
}

const insightsContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
}

const insightCardStyles: React.CSSProperties = {
  padding: '0.85rem',
  borderRadius: '10px',
  transition: 'transform 0.2s'
}

const insightHeaderStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginBottom: '0.4rem'
}

const insightTitleTextStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: 'white',
  margin: 0
}

const insightDescriptionStyles: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: '1.4',
  margin: 0
}

const topLeadsContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem'
}

const topLeadCardStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  padding: '0.85rem',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.2s'
}

const topLeadRankStyles: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: '#667eea',
  minWidth: '36px',
  textAlign: 'center'
}

const topLeadContentStyles: React.CSSProperties = {
  flex: 1
}

const topLeadCompanyStyles: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: '600',
  color: 'white',
  margin: 0,
  marginBottom: '0.4rem'
}

const topLeadReasonStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.6)',
  margin: 0,
  marginBottom: '0.6rem'
}

const topLeadScoreStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
}

const topLeadScoreBarBgStyles: React.CSSProperties = {
  flex: 1,
  height: '6px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '3px',
  overflow: 'hidden'
}

const topLeadScoreBarFillStyles: React.CSSProperties = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s'
}

const topLeadScoreTextStyles: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: '600'
}

const activityTimelineStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  maxHeight: '400px',
  overflowY: 'auto'
}

const activityItemStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start'
}

const activityDotStyles: React.CSSProperties = {
  width: '10px',
  height: '10px',
  background: 'linear-gradient(135deg, #667eea, #764ba2)',
  borderRadius: '50%',
  marginTop: '0.3rem',
  flexShrink: 0
}

const activityContentContainerStyles: React.CSSProperties = {
  flex: 1
}

const activityHeaderRowStyles: React.CSSProperties = {
  display: 'flex',
  gap: '0.6rem',
  alignItems: 'center',
  marginBottom: '0.2rem'
}

const activityIconStyles: React.CSSProperties = {
  fontSize: '1.1rem'
}

const activityDescriptionStyles: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'white',
  margin: 0
}

const activityMetaStyles: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'rgba(255, 255, 255, 0.5)',
  margin: 0
}

const loadingStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center'
}

const errorStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  textAlign: 'center',
  padding: '2rem'
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
  transition: 'transform 0.2s'
}

const emptyStateStyles: React.CSSProperties = {
  textAlign: 'center',
  color: 'rgba(255, 255, 255, 0.5)',
  padding: '2rem',
  fontSize: '1rem'
}


