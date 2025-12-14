FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
COPY tsconfig*.json nest-cli.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY docker/entrypoint.sh ./entrypoint.sh

RUN pnpm install
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3002
EXPOSE 3002

CMD ["sh", "./entrypoint.sh"]
