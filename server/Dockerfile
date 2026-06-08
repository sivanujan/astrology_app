# Use official Node.js image with slim version (saves space, but need to install dependencies)
FROM node:20-slim

# Install Chromium and required font/system packages for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables to use system-installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PORT=3001

WORKDIR /app

# Copy root dependency descriptors
COPY package*.json ./

# Install production dependencies (including devDependencies like tsx, which are required for executing server/index.ts)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Expose the PDF server port
EXPOSE 3001

# Start the PDF server using tsx
CMD ["npx", "tsx", "server/index.ts"]
