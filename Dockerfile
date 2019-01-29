FROM node:10.15.2

RUN apt-get -y update
RUN apt-get -y upgrade

WORKDIR /app
COPY . .
RUN yarn install
RUN cd client && yarn install
RUN cd server && yarn install
RUN cd client && yarn build

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/src/index.js"]
