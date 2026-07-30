FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (default for express might be 3000, 4000, or 5000, assuming 5000)
EXPOSE 5000

# Start server
CMD ["npm", "start"]
