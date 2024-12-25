FROM node:22-slim AS builder
WORKDIR /app
COPY package.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . .
RUN sed -i 's/"typeCheck": true/"typeCheck": false/' nest-cli.json
RUN sed -i 's/.development.env/.production.env/' package.json
RUN npm run build
RUN apt-get update && apt-get install -y openssl
RUN npm run prisma:validate
RUN npm run prisma:generate

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/package.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm i pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/ecosystem.config.js .
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/scripts scripts
COPY --from=builder /app/dist dist

# 使用bash
RUN apt-get update && apt-get install -y \
    bind9-dnsutils \
    bash \
    bash-completion \
    vim \
    openssl \
    curl \
    tcpdump
RUN openssl version

# 清理缓存文件
RUN rm -rf /var/lib/apt/lists/*
EXPOSE 3000
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]
