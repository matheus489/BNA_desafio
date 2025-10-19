# 🎨 DOCUMENTAÇÃO DO FRONTEND - BNA.DEV

## 🎯 **VISÃO GERAL**

O frontend do BNA.dev é construído com **React 18** + **TypeScript** + **Vite**, oferecendo uma interface moderna e responsiva para análise de empresas, chat inteligente e treinamento de objeções.

**URL Local:** `http://localhost:5173`  
**Build:** `npm run build`  
**Dev Server:** `npm run dev`

---

## 🏗️ **ARQUITETURA DO FRONTEND**

### **Estrutura de Componentes**
```
src/
├── main.tsx              # Ponto de entrada
├── pages/                # Páginas da aplicação
│   ├── App.tsx           # Componente principal com navegação
│   ├── Login.tsx         # Autenticação
│   ├── Analyze.tsx       # Análise de empresas
│   ├── Chat.tsx          # Chat RAG
│   ├── History.tsx       # Histórico de análises
│   ├── Compare.tsx       # Comparação de empresas
│   ├── Training.tsx      # Simulador de objeções
│   └── Admin.tsx         # Painel administrativo
└── types/                # Tipos TypeScript
```

### **Design System**
- **Glassmorphism** - Efeito de vidro com blur
- **Gradientes** - Cores vibrantes e modernas
- **Animações** - Transições suaves
- **Responsivo** - Adaptável a diferentes telas
- **Dark Theme** - Tema escuro padrão

---

## 📱 **COMPONENTES PRINCIPAIS**

### **1. 🏠 App.tsx - Componente Principal**

#### **Navegação**
```tsx
const navigationItems = [
  { path: "/", label: "🏠 Início", icon: "🏠" },
  { path: "/analyze", label: "🔍 Analisar", icon: "🔍" },
  { path: "/chat", label: "💬 Chat", icon: "💬" },
  { path: "/history", label: "📊 Histórico", icon: "📊" },
  { path: "/compare", label: "⚖️ Comparar", icon: "⚖️" },
  { path: "/training", label: "🎯 Treinar", icon: "🎯" },
  { path: "/admin", label: "⚙️ Admin", icon: "⚙️" }
];
```

#### **Estilos do Design System**
```tsx
const containerStyles = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column' as const
};

const cardStyles = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '2rem',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};

const buttonStyles = {
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  padding: '1rem 2rem',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(10px)'
};
```

### **2. 🔐 Login.tsx - Autenticação**

#### **Interface de Login**
```tsx
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/';
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>🚀 BNA.dev</h1>
        <p style={subtitleStyles}>Inteligência Artificial para Vendas B2B</p>
        
        <form onSubmit={handleLogin} style={formStyles}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyles}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyles}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyles}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

#### **Estilos do Login**
```tsx
const titleStyles = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  marginBottom: '0.5rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const inputStyles = {
  width: '100%',
  padding: '1.25rem',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  color: 'white'
};
```

### **3. 🔍 Analyze.tsx - Análise de Empresas**

#### **Interface de Análise**
```tsx
const Analyze = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await axios.post('/analyze/', { url });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao analisar');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>🔍 Analisar Empresa</h1>
        
        <form onSubmit={handleAnalyze} style={formStyles}>
          <input
            type="url"
            placeholder="https://exemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputStyles}
            required
          />
          <button
            type="submit"
            disabled={isAnalyzing}
            style={buttonStyles}
          >
            {isAnalyzing ? 'Analisando...' : 'Analisar'}
          </button>
        </form>

        {error && (
          <div style={errorStyles}>
            ❌ {error}
          </div>
        )}

        {result && (
          <div style={resultStyles}>
            <h2 style={resultTitleStyles}>📊 Resultado da Análise</h2>
            <div style={sectionStyles}>
              <div style={labelStyles}>📝 Resumo Executivo</div>
              <div style={contentStyles}>
                <div dangerouslySetInnerHTML={{ __html: result.summary }} />
              </div>
            </div>
            
            {result.key_points && result.key_points.length > 0 && (
              <div style={sectionStyles}>
                <div style={labelStyles}>📊 Informações Estruturadas</div>
                <div style={gridStyles}>
                  {result.key_points.map((point: string, i: number) => (
                    <div key={i} style={pointCardStyles}>
                      <div dangerouslySetInnerHTML={{ __html: point }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### **Estilos da Análise**
```tsx
const sectionStyles = {
  marginBottom: '2rem',
  padding: '1.5rem',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const labelStyles = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
  color: 'rgba(255, 255, 255, 0.9)'
};

const contentStyles = {
  color: 'rgba(255, 255, 255, 0.8)',
  lineHeight: '1.8',
  fontSize: '1rem'
};

const gridStyles = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
};

const pointCardStyles = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '1.75rem',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};
```

### **4. 💬 Chat.tsx - Chat RAG**

#### **Interface do Chat**
```tsx
const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      sources: null,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/chat/', {
        message,
        use_web_search: useWebSearch,
        max_history: 10
      });

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.message,
        sources: response.data.sources,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro no chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyles}>
      <div style={chatContainerStyles}>
        <div style={messagesAreaStyles}>
          {messages.map((msg) => (
            <div key={msg.id} style={messageStyles(msg.role === 'user')}>
              <div style={messageBubbleStyles(msg.role === 'user')}>
                <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                
                {msg.sources && msg.sources.length > 0 && (
                  <div style={sourcesContainerStyles(msg.role === 'user')}>
                    <div style={sourcesTitleStyles}>📚 Fontes:</div>
                    {msg.sources.map((source, i) => (
                      <div key={i} style={sourceItemStyles}>
                        <div style={sourceTitleStyles}>{source.title}</div>
                        <div style={sourceUrlStyles}>{source.url}</div>
                        {source.snippet && (
                          <div style={sourceSnippetStyles}>{source.snippet}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={loadingStyles}>
              <div style={loadingBubbleStyles}>
                <div style={loadingDotsStyles}>
                  <span>●</span>
                  <span>●</span>
                  <span>●</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={inputAreaStyles}>
          <form onSubmit={handleSendMessage} style={inputFormStyles}>
            <div style={inputContainerStyles}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua pergunta sobre as empresas analisadas..."
                style={messageInputStyles}
                rows={3}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                style={sendButtonStyles}
              >
                {isLoading ? '⏳' : '🚀'}
              </button>
            </div>
            
            <div style={optionsStyles}>
              <label style={checkboxStyles}>
                <input
                  type="checkbox"
                  checked={useWebSearch}
                  onChange={(e) => setUseWebSearch(e.target.checked)}
                />
                🔍 Incluir pesquisa na web
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
```

#### **Estilos do Chat**
```tsx
const chatContainerStyles = {
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100vh',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem'
};

const messagesAreaStyles = {
  flex: 1,
  overflowY: 'auto' as const,
  padding: '2.5rem',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1.5rem'
};

const messageStyles = (isUser: boolean) => ({
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  animation: 'fadeIn 0.4s ease-out'
});

const messageBubbleStyles = (isUser: boolean) => ({
  maxWidth: '75%',
  padding: '1.25rem 1.75rem',
  borderRadius: isUser ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
  background: isUser 
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)'
    : 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${isUser ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
  color: 'white',
  boxShadow: isUser 
    ? '0 8px 32px rgba(102, 126, 234, 0.3)' 
    : '0 8px 32px rgba(0, 0, 0, 0.2)',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
  fontSize: '0.98rem'
});
```

### **5. 📊 History.tsx - Histórico de Análises**

#### **Interface do Histórico**
```tsx
const History = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalyses, setSelectedAnalyses] = useState<number[]>([]);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get('/history/');
      setAnalyses(response.data);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta análise?')) {
      try {
        await axios.delete(`/history/${id}`);
        setAnalyses(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error('Erro ao excluir análise:', error);
      }
    }
  };

  const handleCompare = () => {
    if (selectedAnalyses.length >= 2) {
      window.location.href = `/compare?ids=${selectedAnalyses.join(',')}`;
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={headerStyles}>
          <h1 style={titleStyles}>📊 Histórico de Análises</h1>
          <div style={actionsStyles}>
            <button
              onClick={handleCompare}
              disabled={selectedAnalyses.length < 2}
              style={buttonStyles}
            >
              ⚖️ Comparar ({selectedAnalyses.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={loadingStyles}>
            <div style={loadingSpinnerStyles}>⏳</div>
            <p>Carregando análises...</p>
          </div>
        ) : (
          <div style={gridStyles}>
            {analyses.map((analysis) => (
              <div key={analysis.id} style={analysisCardStyles}>
                <div style={cardHeaderStyles}>
                  <h3 style={cardTitleStyles}>{analysis.title}</h3>
                  <div style={cardActionsStyles}>
                    <input
                      type="checkbox"
                      checked={selectedAnalyses.includes(analysis.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAnalyses(prev => [...prev, analysis.id]);
                        } else {
                          setSelectedAnalyses(prev => prev.filter(id => id !== analysis.id));
                        }
                      }}
                      style={checkboxStyles}
                    />
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      style={deleteButtonStyles}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div style={cardContentStyles}>
                  <p style={cardUrlStyles}>{analysis.url}</p>
                  <div style={cardSummaryStyles}>
                    <div dangerouslySetInnerHTML={{ __html: analysis.summary }} />
                  </div>
                </div>
                
                <div style={cardFooterStyles}>
                  <span style={cardDateStyles}>
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

### **6. ⚖️ Compare.tsx - Comparação de Empresas**

#### **Interface de Comparação**
```tsx
const Compare = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalyses, setSelectedAnalyses] = useState<number[]>([]);
  const [comparisonResult, setComparisonResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAnalyses();
    
    // Verifica se há IDs na URL
    const urlParams = new URLSearchParams(window.location.search);
    const ids = urlParams.get('ids');
    if (ids) {
      setSelectedAnalyses(ids.split(',').map(Number));
    }
  }, []);

  const handleCompare = async () => {
    if (selectedAnalyses.length < 2) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('/analyze/compare', {
        analysis_ids: selectedAnalyses
      });
      setComparisonResult(response.data.comparison);
    } catch (error) {
      console.error('Erro na comparação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>⚖️ Comparar Empresas</h1>
        
        <div style={selectionStyles}>
          <h3 style={sectionTitleStyles}>Selecione as análises para comparar:</h3>
          <div style={gridStyles}>
            {analyses.map((analysis) => (
              <div key={analysis.id} style={analysisCardStyles}>
                <input
                  type="checkbox"
                  checked={selectedAnalyses.includes(analysis.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAnalyses(prev => [...prev, analysis.id]);
                    } else {
                      setSelectedAnalyses(prev => prev.filter(id => id !== analysis.id));
                    }
                  }}
                  style={checkboxStyles}
                />
                <div style={cardContentStyles}>
                  <h4 style={cardTitleStyles}>{analysis.title}</h4>
                  <p style={cardUrlStyles}>{analysis.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={actionsStyles}>
          <button
            onClick={handleCompare}
            disabled={selectedAnalyses.length < 2 || isLoading}
            style={buttonStyles}
          >
            {isLoading ? 'Comparando...' : `Comparar (${selectedAnalyses.length})`}
          </button>
        </div>

        {comparisonResult && (
          <div style={resultStyles}>
            <h3 style={resultTitleStyles}>📊 Resultado da Comparação</h3>
            <div style={resultContentStyles}>
              <div dangerouslySetInnerHTML={{ __html: comparisonResult }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **7. 🎯 Training.tsx - Simulador de Objeções**

#### **Interface de Treinamento**
```tsx
const Training = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<number | null>(null);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [currentObjection, setCurrentObjection] = useState<Objection | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateObjections = async () => {
    if (!selectedAnalysis) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('/training/generate-objections', {
        analysis_id: selectedAnalysis,
        difficulty: 'medium'
      });
      setObjections(response.data.objections);
      setCurrentObjection(response.data.objections[0]);
    } catch (error) {
      console.error('Erro ao gerar objeções:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentObjection || !userResponse.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post('/training/submit-response', {
        objection_id: currentObjection.id,
        user_response: userResponse
      });
      setEvaluation(response.data);
    } catch (error) {
      console.error('Erro ao avaliar resposta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextObjection = () => {
    const currentIndex = objections.findIndex(o => o.id === currentObjection?.id);
    if (currentIndex < objections.length - 1) {
      setCurrentObjection(objections[currentIndex + 1]);
      setUserResponse('');
      setEvaluation(null);
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>🎯 Simulador de Objeções</h1>
        
        <div style={sectionStyles}>
          <h3 style={sectionTitleStyles}>Selecione uma empresa:</h3>
          <select
            value={selectedAnalysis || ''}
            onChange={(e) => setSelectedAnalysis(Number(e.target.value))}
            style={inputStyles}
          >
            <option value="">Selecione uma empresa...</option>
            {analyses.map((analysis) => (
              <option key={analysis.id} value={analysis.id}>
                {analysis.title || analysis.url}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleGenerateObjections}
            disabled={!selectedAnalysis || isLoading}
            style={buttonStyles}
          >
            {isLoading ? 'Gerando...' : 'Gerar Objeções'}
          </button>
        </div>

        {currentObjection && (
          <div style={objectionStyles}>
            <h3 style={objectionTitleStyles}>Objeção:</h3>
            <div style={objectionContentStyles}>
              <p style={objectionTextStyles}>{currentObjection.objection}</p>
              <div style={objectionMetaStyles}>
                <span style={metaTagStyles}>Tipo: {currentObjection.type}</span>
                <span style={metaTagStyles}>Dificuldade: {currentObjection.difficulty}</span>
              </div>
              <div style={hintStyles}>
                💡 Dica: {currentObjection.hint}
              </div>
            </div>
          </div>
        )}

        {currentObjection && (
          <div style={responseStyles}>
            <h3 style={responseTitleStyles}>Sua Resposta:</h3>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Digite sua resposta à objeção..."
              style={responseInputStyles}
              rows={4}
            />
            <button
              onClick={handleSubmitResponse}
              disabled={!userResponse.trim() || isLoading}
              style={buttonStyles}
            >
              {isLoading ? 'Avaliando...' : 'Avaliar Resposta'}
            </button>
          </div>
        )}

        {evaluation && (
          <div style={evaluationStyles}>
            <h3 style={evaluationTitleStyles}>
              Pontuação: {evaluation.score}/100
            </h3>
            <div style={evaluationContentStyles}>
              <div dangerouslySetInnerHTML={{ __html: evaluation.feedback }} />
            </div>
            <div style={evaluationActionsStyles}>
              <button onClick={handleNextObjection} style={buttonStyles}>
                Próxima Objeção
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **8. ⚙️ Admin.tsx - Painel Administrativo**

#### **Interface Administrativa**
```tsx
const Admin = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users')
      ]);
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteUser = async (userId: number) => {
    try {
      await axios.put(`/admin/users/${userId}/promote`);
      fetchData();
    } catch (error) {
      console.error('Erro ao promover usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
      }
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <h1 style={titleStyles}>⚙️ Painel Administrativo</h1>
        
        {isLoading ? (
          <div style={loadingStyles}>Carregando...</div>
        ) : (
          <>
            <div style={statsSectionStyles}>
              <h2 style={sectionTitleStyles}>📊 Estatísticas Gerais</h2>
              <div style={statsGridStyles}>
                <div style={statCardStyles}>
                  <h3 style={statTitleStyles}>Total de Usuários</h3>
                  <p style={statValueStyles}>{stats?.total_users}</p>
                </div>
                <div style={statCardStyles}>
                  <h3 style={statTitleStyles}>Total de Análises</h3>
                  <p style={statValueStyles}>{stats?.total_analyses}</p>
                </div>
                <div style={statCardStyles}>
                  <h3 style={statTitleStyles}>Sessões de Treino</h3>
                  <p style={statValueStyles}>{stats?.total_training_sessions}</p>
                </div>
                <div style={statCardStyles}>
                  <h3 style={statTitleStyles}>Usuários Ativos Hoje</h3>
                  <p style={statValueStyles}>{stats?.active_users_today}</p>
                </div>
              </div>
            </div>

            <div style={usersSectionStyles}>
              <h2 style={sectionTitleStyles}>👥 Usuários</h2>
              <div style={usersListStyles}>
                {users.map((user) => (
                  <div key={user.id} style={userCardStyles}>
                    <div style={userInfoStyles}>
                      <span style={userEmailStyles}>{user.email}</span>
                      <span style={userRoleStyles}>{user.role}</span>
                      <span style={userDateStyles}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={userActionsStyles}>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteUser(user.id)}
                          style={promoteButtonStyles}
                        >
                          Promover a Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={deleteButtonStyles}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

---

## 🎨 **DESIGN SYSTEM**

### **Cores e Gradientes**
```tsx
const colors = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
};

const glassmorphism = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
};
```

### **Tipografia**
```tsx
const typography = {
  h1: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    lineHeight: '1.2'
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 'bold',
    lineHeight: '1.3'
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  body: {
    fontSize: '1rem',
    lineHeight: '1.6'
  },
  small: {
    fontSize: '0.875rem',
    lineHeight: '1.5'
  }
};
```

### **Espaçamentos**
```tsx
const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem'
};
```

### **Bordas e Raios**
```tsx
const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '50%'
};
```

---

## 🔧 **CONFIGURAÇÃO E BUILD**

### **Vite Config (`vite.config.ts`)**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  define: {
    'process.env': process.env
  }
});
```

### **TypeScript Config (`tsconfig.json`)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### **Package.json**
```json
{
  "name": "bna-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## 🚀 **DEPLOY E PRODUÇÃO**

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### **Build para Produção**
```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Preview local
npm run preview
```

### **Deploy com Docker**
```bash
# Build da imagem
docker build -t bna-frontend .

# Executar container
docker run -p 5173:5173 bna-frontend
```

---

## 🧪 **TESTES E QUALIDADE**

### **ESLint Config**
```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### **Testes de Componentes**
```typescript
import { render, screen } from '@testing-library/react';
import { Analyze } from './Analyze';

test('renders analyze page', () => {
  render(<Analyze />);
  expect(screen.getByText('Analisar Empresa')).toBeInTheDocument();
});

test('shows loading state', () => {
  render(<Analyze />);
  // Test loading state
});
```

---

## 📱 **RESPONSIVIDADE**

### **Breakpoints**
```tsx
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px'
};

const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`
};
```

### **Grid Responsivo**
```tsx
const responsiveGrid = {
  display: 'grid',
  gap: '1.5rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  '@media (max-width: 768px)': {
    gridTemplateColumns: '1fr'
  }
};
```

---

## 🎯 **MELHORIAS FUTURAS**

### **Funcionalidades Planejadas**
- [ ] **PWA** - Progressive Web App
- [ ] **Offline Support** - Funcionamento offline
- [ ] **Dark/Light Theme** - Alternância de temas
- [ ] **Internationalization** - Suporte a múltiplos idiomas
- [ ] **Accessibility** - Melhorias de acessibilidade

### **Performance**
- [ ] **Code Splitting** - Carregamento sob demanda
- [ ] **Lazy Loading** - Carregamento preguiçoso
- [ ] **Caching** - Cache de dados
- [ ] **Optimization** - Otimizações de performance

---

## 📚 **RECURSOS E REFERÊNCIAS**

### **Documentação**
- **React** - https://react.dev/
- **TypeScript** - https://www.typescriptlang.org/
- **Vite** - https://vitejs.dev/
- **Axios** - https://axios-http.com/

### **Ferramentas**
- **VS Code** - Editor recomendado
- **React DevTools** - Debug de componentes
- **TypeScript** - Verificação de tipos
- **ESLint** - Linting de código

---

## 🎉 **CONCLUSÃO**

O frontend do BNA.dev oferece uma experiência moderna e intuitiva para análise de empresas, chat inteligente e treinamento de objeções. Com design glassmorphism, responsividade completa e integração perfeita com a API, proporciona uma solução completa para equipes de vendas B2B.

**Desenvolvido com ❤️ para revolucionar as vendas B2B! 🚀**
