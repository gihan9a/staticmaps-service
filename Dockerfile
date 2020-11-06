FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

VOLUME [ "/cache" ]

ARG PORT=8080

ENV PORT=${PORT} \
    CACHE_DIRECTORY=/cache \
    IMAGE_FORMAT_DEFAULT=jpg \
    IMAGE_HEIGHT_MAX=1999 \
    IMAGE_HEIGHT_MIN=1 \
    IMAGE_WIDTH_MAX=1999 \
    IMAGE_WIDTH_MIN=1 \
    MARKER_COLOR_DEFAULT=orange \
    PATH_COLOR_DEFAULT=#000000BB \
    POLYGON_FILL_COLOR_DEFAULT=#00000088 \
    TEXT_COLOR=#000000BB \
    TEXT_FILL_COLOR=#000000BB \
    TEXT_FONT=Arial \
    TEXT_SIZE=12 \
    TEXT_WIDTH=1 \
    ZOOM_MAX=20 \
    ZOOM_MIN=1


EXPOSE ${PORT}

CMD [ "node", "index.js" ]