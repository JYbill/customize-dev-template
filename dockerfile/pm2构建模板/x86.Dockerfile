FROM node:20.12.2-alpine

# 创建目录
RUN mkdir -p /app
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 复制源码
COPY . /app

# npm配置
RUN npm config set registry https://registry.npmmirror.com
# 安装pm2
RUN npm install pm2 -g && pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
# 安装生产依赖且不再执行生命周期钩子（如：prepare: "husky"）
RUN npm install --omit=dev --ignore-scripts

# 更新容器内的环境
RUN apk update \
  && apk upgrade \
  && apk add --no-cache --virtual .gyp \
  python3 \
  make \
  g++ \
  && apk del .gyp
RUN apk add --no-cache bash \
  bash-doc \
  bash-completion \
  yasm \
  ffmpeg \
  vim \
  && rm -rf /var/cache/apk/* \
  && /bin/bash


# 如果用到prisma必须先generate生成js、ts代码再进行构建（否则无法通过tsc类型检查）
RUN npm run prisma:generate
RUN npm run build

# 容器启动时，启动应用服务
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]

# 启动容器并挂载.env环境变量
# docker run --name test-partal-backend -p 3000:3000 -v ${volume}:/app/.env resource-partal-and-manage-backend