# Production Dockerfile for BlackClovercut AI
# Includes Node.js 20, FFmpeg, Python3, yt-dlp

FROM node:20-bookworm-slim

# Install system dependencies: FFmpeg, Python3, curl, ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Set working directory
WORKDIR /app

# Copy package manifests first for efficient caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for vite build)
RUN npm install

# Copy application source code
COPY . .

# Build production React frontend bundle
RUN npm run build

# Ensure storage directories exist
RUN mkdir -p storage/uploads storage/clips storage/temp storage/samples

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose server port
EXPOSE 5000

# Start production server
CMD ["node", "server/index.js"]
