FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json .
RUN apk update && apk upgrade
RUN apk add --no-cache bash \
  bash-doc \
  bash-completion \
  vim \
  && /bin/bash
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . /app
RUN npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/package.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm i pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps
COPY --from=builder /app/ecosystem.config.js .
COPY --from=builder /app/prisma prisma
COPY --from=builder /app/scripts scripts
COPY --from=builder /app/dist dist
RUN npm run prisma:generate
# 清理缓存文件
RUN rm -rf /tmp/* && rm -rf /var/tmp/*
EXPOSE 3000
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]
