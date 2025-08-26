FROM node:20.10.0-alpine

WORKDIR /app

COPY docker-ffmpeg .

RUN npm install

RUN apk update && apk add ffmpeg

CMD [ "node", "src/ffmpeg.js" ]