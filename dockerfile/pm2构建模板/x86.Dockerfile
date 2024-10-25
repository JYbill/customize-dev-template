# 测试环境
FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN apk add bash \
  bash-doc \
  bash-completion \
  vim \
  && /bin/bash

RUN npm config set registry https://registry.npmmirror.com
RUN npm install pm2 -g
RUN pm2 install pm2-logrotate && pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 7
RUN npm install --omit=dev --ignore-scripts

COPY . /app

CMD ["pm2", "start", "pm2.config.cjs", "--no-daemon"]
EXPOSE 3000
