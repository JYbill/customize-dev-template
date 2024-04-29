FROM node:20.12.2-alpine

# 创建目录
RUN mkdir -p /app
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 复制源码
COPY . /app

RUN npm config set registry https://registry.npmmirror.com
RUN npm install pm2 -g && pm2 install pm2-logrotate
# pm2 插件
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm install
RUN npm run build
RUN pm2 install pm2-logrotate

# 容器启动时，启动应用服务
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]

# 启动容器并挂载.env环境变量
# docker run --name test-partal-backend -p 3000:3000 -v ${volume}:/app/.env resource-partal-and-manage-backend