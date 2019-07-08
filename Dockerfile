FROM node:10.15.2

RUN apt-get -y update \
  && apt-get -y upgrade \
  && apt-get install -y build-essential python3-pip python3-dev \
  && cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 install --upgrade pip

WORKDIR /app
COPY . .
RUN yarn install
RUN cd server && yarn install
RUN pip install -r requirements.txt

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["yarn", "linux"]
