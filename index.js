require('dotenv').config();

const fs = require('fs');
const fastify = require('fastify')({
  logger: true,
});
fastify.register(require('fastify-favicon'));

const StaticMaps = require('staticmaps');

const {
  parseSize,
  parseCenter,
  parseZoom,
  getImageCacheData,
  parseFormat,
  parseMarkers,
  parsePath,
} = require('./utils');

fastify.get('/', async (request, reply) => {
  try {
    // is center query not provided?
    if (
      request.query.center === undefined
      && request.query.markers === undefined
      && request.query.path === undefined
      && request.query.texts === undefined
    ) {
      throw new Error(
        'At least center, markers, path or texts parameter is required',
      );
    }
    // parse and validate query parameters
    let center = [];
    if (request.query.center) {
      center = parseCenter(request.query.center);
    }
    const { width, height } = parseSize(request.query.size);
    const zoom = request.query.zoom && parseZoom(request.query.zoom);
    const { contentType, extension } = parseFormat(request.query.format);
    const markers = parseMarkers(request.query.markers);
    const lines = parsePath(request.query.path);

    const { isCached, path: imagePath } = getImageCacheData({
      center,
      size: { width, height },
      mimeExt: extension,
      zoom,
      markers,
      lines: [lines],
    });

    // is there a cached copy?
    if (isCached) {
      // send the cached copy
      // @TODO is cache valid?
      reply.type(contentType).code(200);
      return fs.readFileSync(imagePath);
    }

    // create new StaticMap instance
    const map = new StaticMaps({
      width,
      height,
    });

    // markers?
    if (markers.length > 0) {
      markers.forEach((marker) => {
        map.addMarker(marker);
      });
    }

    // path
    if (lines) {
      map.addLine(lines);
    }

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
    // eslint-disable-next-line no-console
    console.error(err);

    // respond error
    reply.type('application/json').code(400);
    return {
      data: 'error',
      error: err.message,
    };
  }
});

fastify.listen(process.env.PORT, '0.0.0.0', (err) => {
  if (err) throw err;
});
