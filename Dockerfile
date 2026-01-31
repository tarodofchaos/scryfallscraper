FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package files
COPY server/package.json ./server/
COPY web/package.json ./web/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start server (run migrations first)
CMD ["sh", "-c", "npx prisma db push && npm start"]
