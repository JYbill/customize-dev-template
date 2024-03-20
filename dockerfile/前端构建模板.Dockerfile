FROM node:14.19.1 as node

WORKDIR /app

COPY . .
RUN npm config set registry https://registry.npmmirror.com
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d/default.conf
RUN rm -f /usr/share/nginx/html/*
COPY --from=node /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
