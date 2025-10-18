FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Expor porta do dev server
EXPOSE 5173

# Comando para iniciar Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]



