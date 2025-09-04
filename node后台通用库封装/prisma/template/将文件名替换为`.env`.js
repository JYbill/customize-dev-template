# 账号密码
USERNAME=xiaoqinvar
PASSWORD=990415

# url
URL=www.jybill.top

# db
DB=prisma

# db url
DB_QUERY=replicaSet=rs0&authSource=admin&minPoolSize=5
DATABASE_URL=mongodb://${USERNAME}:${PASSWORD}@${URL}:27017,${URL}:27018,${URL}:27019/${DB}?${DB_QUERY}

# redis url
# REDIS_USERNAME=root
# REDIS_PASSWORD=990415
# REDIS_URL=redis://:${REDIS_PASSWORD}@101.35.13.180:6379/0
