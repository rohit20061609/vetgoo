FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy application code
COPY .next ./.next
COPY public ./public

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV production

# Start application
CMD ["node_modules/.bin/next", "start"]
