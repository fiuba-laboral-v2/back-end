FROM node:12.14.0
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN rm -rf node_modules
RUN  yarn install
EXPOSE 5434
CMD ["yarn", "start"]
