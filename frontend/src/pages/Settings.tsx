export function Settings() {
  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>⚙️ Configurações</h1>
        <p style={subtitleStyles}>
          Configurações da plataforma BNA.dev
        </p>
      </div>

      {/* Configurações básicas */}
      <div style={sectionStyles}>
        <h2 style={sectionTitleStyles}>🔧 Configurações Gerais</h2>
        <div style={tipContainerStyles}>
          <p style={tipStyles}>
            🎯 <strong>Pipeline:</strong> Gerencie seu pipeline de vendas com drag and drop.
          </p>
          <p style={tipStyles}>
            📊 <strong>Dashboard:</strong> Visualize métricas e KPIs em tempo real.
          </p>
          <p style={tipStyles}>
            🤖 <strong>Chat RAG:</strong> Interaja com a IA para análises inteligentes.
          </p>
        </div>
      </div>
    </div>
  )
}

// Styles
const containerStyles: React.CSSProperties = {
  padding: '2rem 3rem',
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '100vh',
}

const headerStyles: React.CSSProperties = {
  marginBottom: '2rem',
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

const sectionStyles: React.CSSProperties = {
  marginTop: '2rem',
}

const sectionTitleStyles: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '600',
  color: 'white',
  marginBottom: '1rem',
}

const tipContainerStyles: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '1.5rem',
}

const tipStyles: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: '1.6',
  marginBottom: '0.75rem',
}

