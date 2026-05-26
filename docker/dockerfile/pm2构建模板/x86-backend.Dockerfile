# 构建层：需要安装一些额外第三方包的构建依赖
FROM --platform=linux/amd64 node:24.15.0-slim AS builder
WORKDIR /app
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
RUN apt-get update && apt-get install -y build-essential python3 && apt-get clean && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
COPY package.json .
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY patches patches
COPY vendor ./vendor
COPY .npmrc .
ENV NODE_ENV=production
RUN npm pkg delete scripts.prepare
RUN npm install -g pnpm && npm cache clean -f
RUN pnpm --version
RUN pnpm config list
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

# 生产层：减少所有依赖
FROM --platform=linux/amd64 node:24.15.0-slim AS production
WORKDIR /app
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
RUN apt-get update && apt-get install -y bash vim ffmpeg curl procps && apt-get clean && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
ENV NODE_ENV=production
RUN npm install -g pm2 pnpm && npm cache clean -f
RUN pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 7
COPY --from=builder /app/node_modules ./node_modules
COPY . .
# 对vim编辑会读取该环境变量从而使用utf-8而非兜底的latain1字符集
ENV LANG=C.utf8
ENV LC_ALL=C.utf8

# 最终运行相关
EXPOSE 3000
CMD ["pm2-runtime", "pm2.config.cjs"]
