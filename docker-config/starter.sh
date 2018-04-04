#!/bin/bash

cd /app

echo "$GITLAB_IP gitlab.wcentric.com" >> /etc/hosts
ssh-keyscan "gitlab.wcentric.com" >> /root/.ssh/known_hosts
npm install

if [ $ENV = "dev" ]
then
    top
else
    npm run build-$ENV
    npm run start
fi