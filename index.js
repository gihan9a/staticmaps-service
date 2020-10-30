require('dotenv').config();

const fs = require('fs');
const fastify = require('fastify')({
  logger: true,
});
const StaticMaps = require('staticmaps');

const {
  parseSize,
  parseCenter,
  parseZoom,
  getImageCacheData,
  parseFormat,
} = require('./utils');

fastify.get('/', async (request, reply) => {
  try {
    // is center query not provided?
    if (request.query.center === undefined) {
      throw new Error('center parameter is required.');
    }
    // parse and validate query parameters
    const center = parseCenter(request.query.center);
    const { width, height } = parseSize(request.query.size);
    const zoom = parseZoom(request.query.zoom);
    const { contentType, extension } = parseFormat(request.query.format);

    // create new StaticMap instance
    const map = new StaticMaps({
      width,
      height,
    });

    const { isCached, path: imagePath } = getImageCacheData({
      center: [center.longitude, center.latitude],
      size: { width, height },
      mimeExt: extension,
      zoom,
    });

    // is there a cached copy?
    if (isCached) {
      // send the cached copy
      // @TODO is cache valid?
      reply.type(contentType).code(200);
      return fs.readFileSync(imagePath);
    }

    // render new image
    const buffer = await map
      .render([center.longitude, center.latitude], zoom)
      .then(() => {
        map.image.save(imagePath);
        return map.image.buffer(contentType);
      });

    reply.type(contentType).code(200);
    return buffer;
  } catch (err) {
    // logo error
    console.error(err);

    // respond error
    reply.type('application/json').code(200);
    return {
      data: 'error',
      error: err.message,
    };
  }
});

fastify.listen(process.env.PORT, (err) => {
  if (err) throw err;
});
