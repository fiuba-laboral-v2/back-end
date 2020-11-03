FROM node:14.15.0
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN yarn install && \
    npm install pm2@4.2.0 -g && \
    pm2 install typescript
CMD ["yarn", "pm2:start"]
