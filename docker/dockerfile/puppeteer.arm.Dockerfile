FROM --platform=linux/arm64 node:24-bookworm AS base

USER root
WORKDIR /app

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN echo "deb http://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
  echo "deb http://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
  echo "deb http://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list && \
  rm -rf /etc/apt/sources.list.d/* && \
  apt-get update && \
  apt-get install -y --no-install-recommends bash vim curl chromium && \
  apt-get clean && \
  apt-get autoclean && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
RUN npm install -g pnpm && npm cache clean -f

FROM base AS install
COPY package.json .
RUN npm pkg delete scripts.prepare
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY .npmrc .
RUN pnpm --version
RUN pnpm config list
RUN pnpm install --frozen-lockfile && pnpm store prune
COPY . .

FROM install AS format
RUN pnpm format

FROM install AS lint
RUN pnpm lint

FROM install AS test
RUN pnpm test:cov

FROM scratch AS coverage-report
COPY --from=test /app/coverage/ /

FROM base AS production
ENV NODE_ENV=production
ENV LANG=C.utf8
ENV LC_ALL=C.utf8

RUN npm install -g pm2 pnpm && npm cache clean -f
RUN pm2 install pm2-logrotate && \
  pm2 set pm2-logrotate:max_size 200M && \
  pm2 set pm2-logrotate:retain 7
COPY package.json .
RUN npm pkg delete scripts.prepare
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY .npmrc .
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
COPY pm2.config.cjs .
COPY src src
COPY views views

EXPOSE 3000
CMD ["pm2-runtime", "pm2.config.cjs"]
