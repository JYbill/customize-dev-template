# 运行docker容器脚本
docker run -d --name ${name} -p 3000:3000 -e TZ="Asia/Shanghai" \
	-v ${volume}:/app/.env \
	-v ${logoSettingVolume}:/app/dist/setting \
	-v ${assetsVolume}:/app/dist/assets \
	-v /etc/localtime:/etc/localtime \
	resource-partal-and-manage-backend