const between = require('between-range');

/**
 * Parse size query parameter
 *
 * @param {string} size size query parameter in widthxheight format. Optional
 *
 * @returns {object} size
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseSize = (size = undefined) => {
  // validate format
  if (
    size === undefined
    || (
      typeof size === 'string'
      && size.trim().length === 0
    )
  ) {
    return {
      width: parseInt(process.env.IMAGE_WIDTH, 10),
      height: parseInt(process.env.IMAGE_HEIGHT, 10),
    };
  }
  const sizeT = size.trim();
  if (!/^\d+[xX]\d+$/.test(sizeT)) {
    throw new Error('Invalid size format. Format should be width x height in integers(without spaces). Eg. 600x400');
  }

  // find the separator
  const separator = /\x/.test(size) ? 'x' : 'X';
  // extract width and height
  let [width, height] = sizeT.split(separator);
  width = parseInt(width, 10);
  height = parseInt(height, 10);
  // is image width within valid range?
  if (!between(width, process.env.IMAGE_WIDTH_MIN, process.env.IMAGE_WIDTH_MAX)) {
    throw new Error(`Image width should be within ${process.env.IMAGE_WIDTH_MIN}-${process.env.IMAGE_WIDTH_MAX}`);
  }
  // is image height within valid range?
  if (!between(height, process.env.IMAGE_HEIGHT_MIN, process.env.IMAGE_HEIGHT_MAX)) {
    throw new Error(`Image height should be within ${process.env.IMAGE_HEIGHT_MIN}-${process.env.IMAGE_HEIGHT_MAX}`);
  }

  return {
    width,
    height,
  };
};

/**
 * Parse latitude and logitude string and extract them
 *
 * @param {string} latlon Latitude and Logitude parameters as a string separate by comma
 * Eg. -12.445,78.12484
 *
 * @returns {object}
 *
 * @throws Error if latlon validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseGeoCoordinate = (latlon) => {
  if (
    latlon === undefined
    || !/^[ ]*[-]?\d+(\.\d{1,})?,[-]?\d+(\.\d{1,})?[ ]*$/.test(latlon)
  ) {
    throw new Error('Invalid geo coordinate format. Eg. -12.445,78.12484');
  }
  const [latitude, longitude] = latlon.trim().split(',');

  // is latitude within the range?
  if (!between(latitude, -90, 90)) {
    throw new Error('Latitude should be within -90 and 90');
  }
  // is logitude within the range?
  if (!between(longitude, -180, 180)) {
    throw new Error('Longitude should be within -180 and 180');
  }

  return {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };
};

/**
 * Validate center parameter
 *
 * @param {string} center Latitude and Logitude parameters as a string separate by comma
 * Eg. -12.445,78.12484
 *
 * @returns {object} Center geo coordinates
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseCenter = (center) => this.parseGeoCoordinate(center);
