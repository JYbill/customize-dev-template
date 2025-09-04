FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . .
RUN sed -i 's/"typeCheck": true/"typeCheck": false/' nest-cli.json
RUN sed -i 's/.development.env/.production.env/' package.json
RUN npm run build
RUN npm run prisma:validate
RUN npm run prisma:generate

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV production
RUN apk update && apk upgrade
RUN apk add --no-cache bash \
  bash-doc \
  bash-completion \
  vim \
  && /bin/bash
COPY --from=builder /app/package.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm i pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/ecosystem.config.js .
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist dist
# 清理缓存文件
RUN rm -rf /tmp/* && rm -rf /var/tmp/*
EXPOSE 3000
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]
