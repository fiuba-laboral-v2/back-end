FROM node:12.14.0
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN yarn install && \
    npm install pm2@4.2.0 -g && \
    pm2 install typescript && \
    apt-get update && \
    apt-get -y install nano
CMD ["yarn", "pm2:start"]
