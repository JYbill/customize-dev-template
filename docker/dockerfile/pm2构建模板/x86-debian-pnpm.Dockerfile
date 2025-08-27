FROM node:22-slim AS builder
WORKDIR /app
COPY package.json .
COPY patches ./patches
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/ # 备用 RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@10.7.1
RUN pnpm install --ignore-scripts
COPY . .
RUN sed -i 's/"typeCheck": true/"typeCheck": false/' nest-cli.json
RUN npm run build
RUN apt-get update && apt-get install -y openssl
RUN npm run prisma:validate
RUN npm run prisma:generate

FROM node:22-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y \
    ffmpeg \
    bind9-dnsutils \
    bash \
    bash-completion \
    vim \
    openssl \
    curl \
    tcpdump \
    net-tools
ENV NODE_ENV=production
COPY --from=builder /app/package.json .
COPY patches /app/patches
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/ # 备用 RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@10.7.1
RUN npm i pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN pnpm install --ignore-scripts --prod

COPY --from=builder /app/pm2.config.js .
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist dist

# 清理缓存文件
RUN npm cache clean --force
RUN pnpm store prune
RUN rm -rf /tmp/* && rm -rf /var/tmp/*

EXPOSE 3000
CMD ["pm2", "start", "pm2.config.js", "--no-daemon"]
