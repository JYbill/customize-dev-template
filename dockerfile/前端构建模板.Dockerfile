FROM node:14.19.1 as node

# RUN apt-get update; exit 0 # 更新系统包列表，`exit 0` 确保即使更新失败也不会停止 Docker 构建过程
# RUN apt-get install vim -y # 安装 vim 编辑器，-y 选项确保安装过程不需交互式输入

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
