# 部署到第三方docker镜像仓库的shell脚本
echo 'start ...'

branch_name=`git name-rev --name-only HEAD`
tag_id=`git rev-parse HEAD`

service_name="resource-partal-and-manage-backend"

docker_tag="${branch_name}_${tag_id}"
image_id=`docker images ${service_name} | awk '{ print $3 }' | sed -n '2p'`

docker tag ${image_id} registry.cn-hangzhou.aliyuncs.com/weizhujiao/${service_name}:${docker_tag}
docker push registry.cn-hangzhou.aliyuncs.com/weizhujiao/${service_name}:${docker_tag}

echo 'deploy success!!!'
