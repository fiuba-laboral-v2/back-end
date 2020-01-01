FROM node:12.14.0
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN rm -rf node_modules
RUN  yarn install
RUN git clone https://github.com/vishnubob/wait-for-it.git
CMD ["yarn", "start"]
