require('dotenv').config();

const fs = require('fs');
const fastify = require('fastify');
const StaticMaps = require('staticmaps');

const {
  parseSize,
  parseCenter,
  parseZoom,
  getImageCacheData,
  parseFormat,
  parseMarkers,
  parsePath,
  parseText,
  getContentType,
} = require('./utils/utils');

const parseArguments = (query) => {
  const size = parseSize(query.size);
  const zoom = parseZoom(query.zoom);
  const format = parseFormat(query.format);
  const markers = parseMarkers(query.markers);
  const line = parsePath(query.path);
  const text = parseText(query.text);
  const center = parseCenter(query.center, text ? text.coord : []);
  return {
    size,
    zoom,
    format,
    markers,
    lines: line ? [line] : [],
    texts: text ? [text] : [],
    center,
  };
};

const getMapInstance = ({
  size, markers, lines, texts,
}) => {
  const map = new StaticMaps({
    width: size[0],
    height: size[1],
  });

  // markers?
  if (markers.length > 0) {
    markers.forEach((marker) => {
      map.addMarker(marker);
    });
  }

  // path
  if (lines.length > 0) {
    lines.forEach((line) => {
      map.addLine(line);
    });
  }

  // texts
  if (texts.length > 0) {
    texts.forEach((text) => {
      map.addText(text);
    });
  }
  return map;
};

module.exports = function build(options = {}) {
  const app = fastify(options);
  app.get('/', async (request, reply) => {
    try {
      // parse and validate query parameters
      const params = parseArguments(request.query);
      const { isCached, path: imagePath } = getImageCacheData(params);
      const { zoom, format, center } = params;
      const contentType = getContentType(format);
      // is there a cached copy?
      if (isCached) {
        // send the cached copy
        // @TODO is cache valid?
        reply.type(contentType).code(200);
        return fs.readFileSync(imagePath);
      }

      // create new StaticMap instance
      const map = getMapInstance(params);
      // render new image
      const buffer = await map
        .render(center.length > 0 ? center : undefined, zoom)
        .then(() => {
          map.image.save(imagePath);
          return map.image.buffer(contentType);
        });

      reply.type(contentType).code(200);
      return buffer;
    } catch (err) {
      // logo error
      if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.log(err);
      }

      // respond error
      reply.type('application/json').code(400);
      return {
        data: 'error',
        error: err.message,
      };
    }
  });

  return app;
};
