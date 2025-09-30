FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

# Build shared package
WORKDIR /app/packages/shared
RUN npm run build

# Switch to backend
WORKDIR /app/packages/backend

# Generate Prisma client
RUN npx prisma generate

# Create logs directory
RUN mkdir -p logs

EXPOSE 3001

CMD ["npm", "run", "dev"]
