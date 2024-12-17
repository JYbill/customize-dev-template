FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json .
RUN apk add --no-cache openssl
RUN npm config set registry https://registry.npmmirror.com
RUN npm install --ignore-scripts --legacy-peer-deps
COPY . .
RUN sed -i 's/"typeCheck": true/"typeCheck": false/' nest-cli.json
RUN npm run build
COPY ecosystem.config.js .
COPY prisma prisma
COPY scripts scripts

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/package.json .
RUN npm config set registry https://registry.npmmirror.com
RUN npm i pm2 -g
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 200M && pm2 set pm2-logrotate:retain 60
RUN npm install --omit=dev --ignore-scripts --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/ecosystem.config.js .
COPY --from=builder /app/prisma prisma
COPY --from=builder /app/dist dist
# openssl某些库会需要，如：prisma
RUN apk update && apk add --no-cache bash \
                    bash-doc \
                    bash-completion \
                    vim \
                    openssl \
                    && /bin/bash
RUN openssl --version
RUN npm run prisma:generate
# 清理缓存文件
RUN rm -rf /tmp/* && rm -rf /var/tmp/*
EXPOSE 3000
CMD ["pm2", "start", "ecosystem.config.js", "--no-daemon"]
