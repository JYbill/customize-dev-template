FROM --platform=linux/amd64 node:24.3-slim

WORKDIR /app

# 拆分方便检查每一层的磁盘占用
RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
   echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
   rm -rf /etc/apt/sources.list.d/*
# 一些方便线上调试的工具（避免弱网环境不方便）
RUN apt-get update && apt-get install -y bash vim ffmpeg curl && apt-get clean && apt-get autoclean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY package.json .
ENV NODE_ENV=production
RUN npm config set registry http://192.168.88.115:8081/repository/npm-proxy/
RUN npm install -g pm2 pnpm && npm cache clean -f
RUN pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 7
RUN pnpm install --prod --ignore-scripts --reporter=ndjson && pnpm store prune

COPY . .

EXPOSE 3000
CMD ["pm2", "start", "pm2.config.cjs", "--no-daemon"]
