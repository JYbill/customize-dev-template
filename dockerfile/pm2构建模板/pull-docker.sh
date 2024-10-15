#!/bin/bash
tag_id=$1
# service_name="..."
# volume_path="..."
# oss_path="..."
# docker_repo_name="..."

if [ "$tag_id" = "" ]; then
  echo "please input tag_id"
  exit 0
fi

docker pull ${docker_repo_name}:${tag_id}
docker stop ${service_name}
docker rm ${service_name}
docker run --name ${service_name} --restart always -d -v ${volume_path}/logs:/app/logs -v /etc/localtime:/etc/localtime ${docker_repo_name}:${tag_id}