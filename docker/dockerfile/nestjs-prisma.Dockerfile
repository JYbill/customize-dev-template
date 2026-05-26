FROM --platform=linux/amd64 node:24.8.0-slim AS builder
WORKDIR /app
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
  echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
  echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
  rm -rf /etc/apt/sources.list.d/*
RUN apt-get update && apt-get install -y openssl build-essential python3 && apt-get clean && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
ENV NODE_ENV=production
COPY package.json .
COPY .npmrc .
RUN npm i -g pnpm && npm cache clean -f
COPY patches patches
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN pnpm install --frozen-lockfile && pnpm store prune
COPY . .
RUN pnpm prisma:generate
RUN pnpm build

FROM --platform=linux/amd64 node:24.8.0-slim AS production
WORKDIR /app
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
  echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
  echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
  rm -rf /etc/apt/sources.list.d/*
RUN apt-get update && apt-get install -y openssl build-essential python3 bash vim curl ffmpeg && apt-get clean && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
ENV NODE_ENV=production
COPY package.json .
COPY .npmrc .
RUN npm install -g pm2 pnpm && npm cache clean -f
COPY patches patches
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
RUN pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 7
COPY pm2.config.js .
COPY --from=builder /app/dist dist

EXPOSE 3000
CMD ["pm2-runtime", "pm2.config.js"]
