FROM node:20.12.2-alpine

# 创建目录
RUN mkdir -p /app
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 复制源码
COPY . /app

RUN npm install --ignore-scripts
RUN npm install pm2 -g && pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm run prisma:generate
RUN npm run build

# 容器启动时，启动应用服务
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]
