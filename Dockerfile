FROM node:latest

WORKDIR /bot

COPY package*.json ./

RUN npm install

COPY . .  

ENV TELEGRAM_TOKEN ""
ENV ABSTRACT_API_KEY ""

CMD [ "node", "index.js" ]