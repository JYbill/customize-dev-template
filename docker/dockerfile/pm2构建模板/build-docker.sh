#!/bin/bash
push_to_aliyun=true
platform=x86
while getopts ":p:s" opt
do
  case $opt in
    p ) platform=$OPTARG;;
    s ) push_to_aliyun=false;;
    * ) echo "wrong paramters"
      exit 1;;
  esac
done
shift $(($OPTIND - 1))

echo "platform:${platform}"
branch_name=`git symbolic-ref --short HEAD`
echo "present_branch_name:${branch_name}"
version_id=`git rev-parse HEAD`
echo "version_id:${version_id}"
tag_id=${version_id:0:10}

# service_name="..."
service_image_name="${service_name}-img"
docker build -f "${platform}.Dockerfile" -t ${service_image_name} .
image_id=`docker images ${service_image_name} | awk '{ print $3 }' | sed -n '2p'`
echo "image_id:${image_id}"

docker_tag="${platform}-${branch_name//\//-}_${tag_id}"
echo "docker_tag:${docker_tag}"
if [[ "$push_to_aliyun" == "true" ]]; then
  echo "docker start push"
  # docker login ...
  # docker tag ${image_id} ${tag}
  # docker push ${image_id}:${tag}
  if [ $? -ne 0 ]; then
    echo "docker push fail!"
    exit 1
  fi
  echo "docker push done!"
else
  echo "docker start save"
  docker save ${image_id} -o images.tar
  echo "docker start done!"
fi
