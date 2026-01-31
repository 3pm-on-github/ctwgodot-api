FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g nodemon

EXPOSE 7000

CMD ["nodemon", "--watch", ".", "--ext", "js,html,css", "src/index.js"]