FROM --platform=linux/amd64 node:24.3-slim AS builder
WORKDIR /app
COPY package.json .
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/ # 备用 RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm
RUN pnpm install
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
RUN apt-get update
RUN apt-get install -y openssl
COPY . .
RUN pnpm prisma:generate

FROM --platform=linux/amd64 node:24.3-slim AS production
WORKDIR /app

# 拆分方便检查每一层的磁盘占用
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
RUN apt-get update
RUN apt-get install -y bash vim
# 一些方便线上调试的工具（避免弱网环境不方便）
RUN apt-get install -y bind9-dnsutils
RUN apt-get install -y curl
RUN apt-get install -y net-tools
RUN apt-get clean

COPY --from=builder /app/package.json .
ENV NODE_ENV=production
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/ # 备用 RUN npm config set registry https://registry.npmmirror.com
RUN npm i pm2 pnpm -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN pnpm install --prod --ignore-scripts
RUN pnpm store prune

# 清理缓存文件
RUN rm -rf /tmp/* /var/tmp/* /var/lib/apt/lists/* /var/cache/apt/archives/*
COPY --from=builder /app/pm2.config.js .
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/scripts scripts
COPY --from=builder /app/dist dist
EXPOSE 3000
CMD ["pm2", "start", "pm2.config.js", "--no-daemon"]
