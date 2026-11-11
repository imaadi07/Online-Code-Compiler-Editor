# backend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build & system dependencies if needed
RUN apk add --no-cache curl

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure the executions directory exists
RUN mkdir -p executions

# Expose backend API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the compiler server
CMD ["node", "index.js"]
