# Use Node.js as the base image
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# Install dependencies
RUN pnpm install

# Copy project files
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Copy package files for production
COPY package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/

# Install only production dependencies
RUN pnpm install --prod

# Copy built application from builder stage
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/public ./apps/server/public

# Copy environment file for production
COPY .env.production ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "apps/server/dist/main.js"]