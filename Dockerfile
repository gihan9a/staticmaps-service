FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

VOLUME [ "/cache" ]

ARG PORT=8080

ENV PORT=${PORT} \
    IMAGE_WIDTH_DEFAULT=600 \
    IMAGE_WIDTH_MIN=1 \
    IMAGE_WIDTH_MAX=1999 \
    IMAGE_HEIGHT_DEFAULT=400 \
    IMAGE_HEIGHT_MIN=1 \
    IMAGE_HEIGHT_MAX=1999 \
    ZOOM_MIN=1 \
    ZOOM_MAX=16 \
    IMAGE_FORMAT_DEFAULT=jpg \
    CACHE_DIRECTORY=/cache

EXPOSE ${PORT}

CMD [ "node", "index.js" ]