FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy project files
COPY package.json ./
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Install deps & build
RUN pnpm install
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main.js"]
