FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm ci

# Copy the rest of the app (not strictly needed for dev bind-mount, but useful for build cache)
COPY . .

# Expose CRA default port
EXPOSE 3000

# Default to development server
CMD ["npm", "start"]

