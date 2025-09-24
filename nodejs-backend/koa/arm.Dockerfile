FROM --platform=linux/arm64 node:24.3-slim

WORKDIR /app

COPY package.json .

RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/
RUN npm install -g pm2 pnpm
RUN pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 7
RUN pnpm install --prod --ignore-scripts --reporter=ndjson && pnpm approve-builds
RUN pnpm store prune

RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y bash vim
RUN apt-get install -y ffmpeg
# 一些方便线上调试的工具（避免弱网环境不方便）
RUN apt-get install -y bind9-dnsutils
RUN apt-get install -y curl
RUN apt-get install -y net-tools

COPY . .

RUN rm -rf /tmp/* && rm -rf /var/tmp/*
EXPOSE 3000
CMD ["pm2", "start", "pm2.config.cjs", "--no-daemon"]
