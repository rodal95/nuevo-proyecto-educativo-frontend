# frontend/Dockerfile (versión final con build args)

# --- Etapa 1: Build ---
FROM node:20 AS builder

# --- AÑADIMOS ESTAS LÍNEAS ---
# Declara el argumento que esperamos recibir desde docker-compose.yml
ARG NEXT_PUBLIC_API_URL
# Lo convierte en una variable de entorno disponible para esta etapa de build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Ahora, 'npm run build' podrá ver process.env.NEXT_PUBLIC_API_URL
RUN npm run build

# --- Etapa 2: Production ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]
