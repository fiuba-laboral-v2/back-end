FROM node:12.14.0
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN yarn install
CMD ["yarn", "pm2:start"]
