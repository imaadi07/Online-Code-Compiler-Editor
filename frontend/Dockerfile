# Stage 1: Build production React assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:1.27-alpine

# Copy built artifacts to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom reverse-proxy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
