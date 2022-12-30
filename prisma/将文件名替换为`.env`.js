# 账号密码
USERNAME=xiaoqinvar
PASSWORD=990415

# url
URL=www.jybill.top

# db
DB=passport-casbin

# db url
DATABASE_URL=mongodb://${USERNAME}:${PASSWORD}@${URL}:27017,${URL}:27018,${URL}:27019/${DB}?replicaSet=rs0&authSource=admin

# redis url
# REDIS_USERNAME=root
# REDIS_PASSWORD=990415
# REDIS_URL=redis://:${REDIS_PASSWORD}@101.35.13.180:6379/0
