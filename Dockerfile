FROM dockerfile/nodejs
ADD ./src /app
WORKDIR /app
RUN npm install
CMD ["node", "/app/index.js"]