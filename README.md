## build docker image

- `docker build . -t holiday-bot`

## start container

- `docker run -e "TELEGRAM_TOKEN=" -e "ABSTRACT_API_KEY=" -d holiday-bot`

## deploy to aws

- create repository
- - `aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 982720015910.dkr.ecr.us-east-1.amazonaws.com`
- - `aws ecr create-repository --repository-name holiday-bot --image-scanning-configuration scanOnPush=true --region us-east-1`
- build docker image
- - `docker build . -t holiday-bot`
- - `docker tag subbot:latest 982720015910.dkr.ecr.us-east-1.amazonaws.com/subbot:latest`
- push to ecr repository
- - `aws ecr get-login-password | docker login --username AWS --password-stdin 982720015910.dkr.ecr.us-east-1.amazonaws.com`
- - `docker push 982720015910.dkr.ecr.us-east-1.amazonaws.com/subbot:latest`
- create iam role
- - `aws iam create-role --role-name holiday-bot-role --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Sid":"","Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'`
- - `aws iam put-role-policy --role-name holiday-bot-role --policy-name ECRPolicy --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ecr:GetAuthorizationToken","ecr:BatchCheckLayerAvailability","ecr:GetDownloadUrlForLayer","ecr:BatchGetImage"],"Resource":"*"}]}'`
- - `aws iam create-instance-profile --instance-profile-name holiday-bot-instance-profile`
- - `aws iam add-role-to-instance-profile --role-name holiday-bot-role --instance-profile-name holiday-bot-instance-profile`
- create security group
- - `aws ec2 create-security-group --group-name holiday-bot-security-group --description "holiday-bot Security Group"`
- create ec2 instance
- - `aws ec2 run-instances --image-id ami-0ed9277fb7eb570c9 --count 1 --instance-type t2.micro --security-groups holiday-bot-security-group --iam-instance-profile Name=holiday-bot-instance-profile --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=holiday-bot}]' --user-data $'#!/bin/sh\nyum update -y\namazon-linux-extras install docker -y\nservice docker start\nusermod -a -G docker ec2-user\nchkconfig docker on\ndocker login -u AWS -p $(aws ecr get-login-password --region us-east-1) 982720015910.dkr.ecr.us-east-1.amazonaws.com\ndocker pull 982720015910.dkr.ecr.us-east-1.amazonaws.com/holiday-bot:latest\ndocker run -e "TELEGRAM_TOKEN=5043712259:AAE-RZbzoPs74-1fax_D3dZCLHUoVVDF2UU" -e "ABSTRACT_API_KEY=6e6163567ae34d3f8e97a7d225156bc5" --rm 982720015910.dkr.ecr.us-east-1.amazonaws.com/holiday-bot:latest'`
