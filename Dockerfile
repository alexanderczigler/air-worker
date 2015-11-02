FROM node

WORKDIR /app

ADD ./package.json /app/package.json
RUN npm install

ADD ./index.js /app/index.js
ADD ./lib /app/lib

CMD ["node", "/app/index.js"]
