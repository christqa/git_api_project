#!/bin/bash
REGISTRY=413169821055.dkr.ecr.us-east-2.amazonaws.com
IMAGE_NAME=$REGISTRY/spectra-api
VERSION=`git rev-parse HEAD | head -c 8`
TAG=$IMAGE_NAME:$VERSION

# Build the image using initial data
cd "$(dirname "$0")"
cd ..
pwd

docker build -t $TAG .

DOCKER_BUILD_STATUS=$?
if [ "$DOCKER_BUILD_STATUS" -ne "0" ]
then
    exit
fi

# Tag and push to ECR
docker tag $TAG $IMAGE_NAME:latest

# AWS login and push
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $REGISTRY

docker push $TAG
docker push $IMAGE_NAME:latest

echo ::set-output name=docker_image_tag::"$VERSION"
