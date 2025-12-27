FROM --platform=linux/amd64 node:24.8.0-slim AS builder
WORKDIR /app

COPY .npmrc .
COPY package.json .
COPY pnpm-workspace.yaml .
RUN npm i -g pnpm && npm cache clean -f
RUN pnpm install && pnpm store prune
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

FROM --platform=linux/amd64 node:24.8.0-slim AS production
WORKDIR /app
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
RUN apt-get update && apt-get install -y bash vim curl && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
ENV NODE_ENV=production
COPY .npmrc .
COPY package.json .
COPY pnpm-workspace.yaml .
RUN npm i pm2 pnpm -g && npm cache clean -f
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN pnpm install --prod && pnpm store prune
COPY ecosystem.config.js .
COPY --from=builder /app/dist dist
EXPOSE 7500
CMD ["pm2-runtime", "ecosystem.config.js"]
