# 🎬 Script de Demonstração - Entrevista BNA.dev

Roteiro prático para demonstrar o sistema RAG durante a entrevista.

---

## ⏱️ Timeline da Demo (10 minutos)

| Tempo | Ação | Objetivo |
|-------|------|----------|
| 0-2 min | Contexto do problema | Mostrar compreensão do desafio |
| 2-4 min | Fluxo básico (Análise) | Demonstrar solução core |
| 4-8 min | **RAG Chat (DESTAQUE!)** | WOW moment - diferencial |
| 8-9 min | Arquitetura técnica | Mostrar profundidade técnica |
| 9-10 min | Q&A | Abrir para perguntas |

---

## 🎯 PARTE 1: Contexto (2 min)

### Fala Sugerida

> "Entendi que o time de vendas da BNA perde muito tempo fazendo research antes de reuniões. 
> Desenvolvi uma solução que não só automatiza isso, mas vai além: 
> **permite fazer perguntas naturais sobre as empresas analisadas**, 
> combinando dados do banco com **pesquisa automática na internet em tempo real**.
>
> Isso está 100% alinhado com o lema da BNA: **80% IA + 20% Humano = 100% Solução**."

### Pontos-chave a mencionar
- ✅ Problema: Research manual é lento e inconsistente
- ✅ Solução: Automação + Inteligência
- ✅ Diferencial: Chat RAG com web search
- ✅ Alinhamento: 80/20 IA/Humano

---

## 🎯 PARTE 2: Demonstração Básica (2 min)

### Passo 1: Login
1. Abra http://localhost:5173
2. Faça login (ou mostre já logado)

> "Sistema tem autenticação JWT, controle de acesso por roles, etc."

### Passo 2: Análise de Site
1. Vá em **"📊 Analisar"**
2. Cole uma URL: `https://www.bna.dev.br`
3. Clique em **"🚀 Analisar"**

> "Aqui fazemos scraping do site, limpamos o HTML, 
> e usamos GPT-4 para extrair informações relevantes para vendas:
> ICP, produtos, pricing, stack tecnológico, contatos..."

### Aguarde resultado
- Mostre o **resumo**
- Destaque os **pontos-chave**
- Aponte as **entidades extraídas** (JSON estruturado)

> "Tudo isso é salvo no banco com deduplicação por URL, 
> então não reprocessamos se alguém já analisou."

---

## 🎯 PARTE 3: RAG Chat - O DESTAQUE! (4 min)

### Setup
> "Mas o diferencial real está aqui: **Chat RAG com Web Search**."

1. Vá em **"🤖 Chat RAG"**
2. Mostre a interface

> "Este não é um chat simples. É um sistema RAG completo que:
> 1. Busca no histórico de análises usando **embeddings vetoriais**
> 2. Pesquisa automaticamente na **internet em tempo real**
> 3. Combina tudo e gera respostas contextualizadas com **GPT-4**
> 4. **Sempre cita as fontes**"

### Demo 1: Pergunta sobre análise feita

**Digite:**
```
"Qual o stack tecnológico da BNA.dev?"
```

**Aguarde resposta e mostre:**
- ✅ Resposta precisa
- ✅ **Fontes citadas** (badge "💾 Banco")
- ✅ Link para a análise original

> "Veja: ele encontrou a informação na análise que acabamos de fazer,
> calculou similaridade vetorial, e retornou com fonte."

### Demo 2: Pergunta que requer web search

**Digite:**
```
"Quais são as últimas tendências em IA para vendas B2B?"
```

**Aguarde resposta e mostre:**
- ✅ Indicador "Processando... (RAG + Web Search)"
- ✅ Resposta atualizada
- ✅ **Fontes web citadas** (badge "🌐 Web")
- ✅ Links de artigos encontrados

> "Aqui o sistema percebeu que não tinha essa info no banco,
> fez busca automática no Google, scrapeou as páginas relevantes,
> e gerou uma resposta atualizada."

### Demo 3: Pergunta contextual (memória de conversa)

**Digite:**
```
"E como a BNA poderia usar essas tendências?"
```

**Aguarde resposta:**
- ✅ Sistema entende contexto anterior
- ✅ Combina info da BNA + tendências discutidas
- ✅ Gera insights estratégicos

> "O sistema mantém contexto da conversa inteira.
> Isso permite um fluxo natural, como conversar com um analista."

### Demo 4: Pergunta agregada

**Digite:**
```
"Quantas empresas já analisei e quais usam Python?"
```

**Mostre:**
- ✅ Análise quantitativa
- ✅ Filtragem inteligente
- ✅ Listagem estruturada

> "Ele consegue agregar dados, filtrar, e apresentar de forma organizada."

---

## 🎯 PARTE 4: Arquitetura Técnica (1 min)

### Diagrama Mental (fale enquanto mostra)

> "A arquitetura é assim:
>
> **Backend:**
> - FastAPI com estrutura modular (routers, services, models)
> - PostgreSQL para persistência
> - Serviços especializados:
>   - **embeddings.py**: Gera vetores semânticos (OpenAI ada-002)
>   - **web_search.py**: Busca Google/DuckDuckGo + scraping
>   - **llm.py**: Integração GPT-4
>
> **Frontend:**
> - React + TypeScript
> - Interface moderna e responsiva
> - Real-time updates
>
> **IA:**
> - Embeddings vetoriais (1536 dimensões)
> - Similaridade de cosseno para RAG
> - GPT-4 para geração
> - Contexto rico: Banco + Web + Histórico"

---

## 🎯 PARTE 5: Diferenciais para Destacar

### Durante a demo, enfatizar:

#### 1. Técnicos
- ✅ **RAG completo**, não só teoria
- ✅ **Web search automático** com fallback
- ✅ **Fontes rastreáveis** (compliance)
- ✅ **Código limpo** e documentado
- ✅ **Production-ready** (auth, cache, error handling)

#### 2. Negócio
- ✅ Alinhado ao lema "80/20"
- ✅ ROI mensurável (economia de tempo)
- ✅ Escalável
- ✅ Conhecimento acumulado do time
- ✅ UX pensada para vendedores

#### 3. Bônus Implementados
- ✅ Autenticação e autorização (JWT + RBAC)
- ✅ UI moderna e polida
- ✅ Admin panel
- ✅ Histórico persistente
- ✅ Deduplicação (cache inteligente)
- ✅ Documentação completa

---

## 💡 Perguntas que Podem Fazer

### Q: "Por que não usar apenas GPT-4 direto?"

**Resposta:**
> "GPT-4 sozinho tem dois problemas:
> 1. **Não conhece suas empresas específicas** (dados privados)
> 2. **Conhecimento cortado** em data antiga
>
> RAG resolve ambos: injeta contexto real do banco E busca web atualizada.
> É a diferença entre um assistente genérico e um **especialista na sua operação**."

### Q: "Como garante que as fontes são confiáveis?"

**Resposta:**
> "Três camadas:
> 1. **Fontes do banco**: São análises que o próprio time já fez
> 2. **Fontes web**: Mostramos a URL, usuário pode validar
> 3. **LLM prompt**: Instruímos o GPT-4 a ser factual e citar fontes
>
> Importante: **não ocultamos** de onde veio a info, transparência total."

### Q: "Qual o custo por consulta?"

**Resposta:**
> "~$0.02 por interação completa:
> - Embedding: $0.0001
> - GPT-4: $0.01-0.03
>
> Mas o ROI é absurdo: se economiza **1 hora de pesquisa manual**,
> que custa $50-100, o ROI é de **25-50x**.
>
> Além disso, tem cache: mesma URL não reprocessa."

### Q: "Como escalaria para 100 usuários?"

**Resposta:**
> "Já está preparado:
> 1. **Backend**: Async (FastAPI), pode escalar horizontalmente
> 2. **Banco**: PostgreSQL aguenta bem, pode usar read replicas
> 3. **Cache**: Dedup evita chamadas desnecessárias
> 4. **Rate limiting**: Adicionar Nginx/Kong
> 5. **Vector DB**: Migrar para Pinecone/Weaviate se necessário
>
> Estimativa: Suporta 50-100 usuários na arquitetura atual,
> 1000+ com ajustes simples (load balancer, cache Redis)."

### Q: "E se o OpenAI cair?"

**Resposta:**
> "Já tem fallback no código:
> - Web search tem fallback DuckDuckGo
> - LLM tem análise mock inteligente (regex patterns)
> - Pode adicionar provider alternativo (Anthropic, Llama local)
>
> Arquitetura é **provider-agnostic**, fácil trocar."

### Q: "Próximos passos que você faria?"

**Resposta:**
> "Curto prazo:
> 1. **Streaming de respostas** (melhor UX)
> 2. **Testes automatizados** (coverage 80%+)
> 3. **Monitoring** (Sentry, DataDog)
>
> Médio prazo:
> 1. **Integração CRM** (HubSpot, Salesforce)
> 2. **Chrome extension** (analisar direto do navegador)
> 3. **Análise comparativa** (competitors side-by-side)
>
> Longo prazo:
> 1. **Fine-tuning** de modelo (dados próprios)
> 2. **Multi-tenant** (SaaS)
> 3. **Voice interface**"

---

## 🎭 Dicas de Apresentação

### Linguagem Corporal
- ✅ Mantenha contato visual
- ✅ Gesticule ao explicar arquitetura
- ✅ Sorria ao mostrar features legais
- ✅ Confiante mas humilde

### Tom de Voz
- ✅ Empolgado mas profissional
- ✅ Pause após pontos importantes
- ✅ Varie ritmo (mais rápido em partes básicas, mais devagar em diferenciais)

### Narrativa
- ✅ Conte uma história: Problema → Solução → Impacto
- ✅ Use "nós" ao falar do usuário ("se o vendedor precisa...")
- ✅ Conecte features a valor de negócio

---

## ✅ Checklist Pré-Demo

**Técnico:**
- [ ] Backend rodando sem erros
- [ ] Frontend carregando
- [ ] OpenAI key configurada e com créditos
- [ ] Banco populado com 2-3 análises
- [ ] Chat testado e funcionando
- [ ] Internet estável (para web search)

**Apresentação:**
- [ ] Script lido 2-3x
- [ ] Perguntas de demo preparadas
- [ ] Respostas para Q&A ensaiadas
- [ ] Cronômetro configurado (10 min)
- [ ] Tela limpa (feche abas desnecessárias)

**Mental:**
- [ ] Descansado e focado
- [ ] Confiante no que foi construído
- [ ] Pronto para responder perguntas técnicas
- [ ] Empolgado para mostrar o trabalho

---

## 🎯 Objetivo da Demo

Ao final, o entrevistador deve pensar:

> *"Caramba, esse candidato:*
> - ✅ *Entendeu o problema de verdade*
> - ✅ *Construiu algo além do básico*
> - ✅ *Tem profundidade técnica*
> - ✅ *Pensa em produto e UX*
> - ✅ *Está alinhado com nossa cultura (80/20)*
> - ✅ *Seria ótima adição ao time!"*

---

## 🎉 Mensagem Final

> "Construí isso pensando no dia a dia real do time de vendas da BNA.
> Não é só uma demo técnica - é uma ferramenta que eu usaria.
> E o melhor: é só o começo. Tem tantas coisas legais que podemos adicionar.
>
> Estou muito empolgado com a possibilidade de trabalhar com vocês
> e levar isso (e muito mais) para produção!"

---

## 📞 Contato Pós-Demo

Se pedirem para enviar algo depois:
- ✅ Link do GitHub (se público)
- ✅ Documentação: README + RAG_GUIDE + IMPLEMENTACAO_RAG
- ✅ Video/gif da demo (opcional mas impacta)
- ✅ Deck de apresentação (opcional)

---

**Boa sorte! Você arrasou no desenvolvimento, agora é hora de brilhar na apresentação! 🌟**

---

*"Code is poetry, but presentation is the gallery where it shines."*

