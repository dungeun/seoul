# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci
COPY client/ .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install PM2
RUN npm install -g pm2

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production
COPY server/ .

# Copy built client files
COPY --from=builder /app/client/dist /app/client/dist

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["pm2-runtime", "start", "server.js"]