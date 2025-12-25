# 构建层
FROM --platform=linux/amd64 node:24.3-slim AS builder
WORKDIR /app
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
# 一些需要的构建命令行
RUN apt-get update && apt-get install -y openssl build-essential && apt-get clean && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
COPY .npmrc .
COPY package.json .
COPY pnpm-workspace.yaml .
RUN npm i -g pnpm && npm cache clean -f
# 如果无编译内容，可以使用pnpm install --prod
RUN pnpm install && pnpm store prune
COPY prisma prisma
RUN pnpm prisma:generate

# 生产层
FROM --platform=linux/amd64 node:24.3-slim AS production
WORKDIR /app
# 拆分方便检查每一层的磁盘占用
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
# 一些方便线上调试的工具（避免弱网环境不方便）
RUN apt-get update && apt-get install -y bash vim curl && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
ENV NODE_ENV=production
COPY .npmrc .
RUN npm i pm2 pnpm -g && npm cache clean -f
RUN pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 7
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# 最终运行相关
EXPOSE 3000
CMD ["pm2-runtime", "pm2.config.cjs"]
