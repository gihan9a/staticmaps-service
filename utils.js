const fs = require('fs');
const path = require('path');
const { inRange } = require('lodash');
const md5 = require('md5');

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

  const widthMin = parseInt(process.env.IMAGE_WIDTH_MIN, 10);
  const widthMax = parseInt(process.env.IMAGE_WIDTH_MAX, 10);
  // is image width within valid range?
  if (!inRange(width, widthMin, widthMax + 1)) {
    throw new Error(`Image width should be within ${widthMin}-${widthMax}`);
  }
  const heightMin = parseInt(process.env.IMAGE_HEIGHT_MIN, 10);
  const heightMax = parseInt(process.env.IMAGE_HEIGHT_MAX, 10);
  // is image height within valid range?
  if (!inRange(height, heightMin, heightMax + 1)) {
    throw new Error(`Image height should be within ${heightMin}-${heightMax}`);
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
  if (!inRange(latitude, -90, 90 + 1)) {
    throw new Error('Latitude should be within -90 and 90');
  }
  // is logitude within the range?
  if (!inRange(longitude, -180, 180 + 1)) {
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

/**
 * Parse zoom level of the map
 *
 * @param {string} level Zoom level as a string
 *
 * @returns {number}
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseZoom = (level = undefined) => {
  // is level empty?
  if (
    level === undefined
    || (
      typeof level === 'string'
      && level.trim().length === 0
    )
  ) {
    return parseInt(process.env.ZOOM_DEFAULT, 10);
  }

  // is invalid?
  if (typeof level !== 'string') {
    throw new Error('zoom parameter should be string type');
  }

  if (!/^\d+$/.test(level.trim())) {
    throw new Error('Invalid zoom value. zoom value should be a integer eg. 10');
  }
  const levelValidated = parseInt(level.trim(), 10);

  const zoomMin = parseInt(process.env.ZOOM_MIN, 10);
  const zoomMax = parseInt(process.env.ZOOM_MAX, 10);

  // is not within the range?
  if (!inRange(levelValidated, zoomMin, zoomMax + 1)) {
    throw new Error(`Invalid zoom value. zoom should be within ${zoomMin}-${zoomMax}`);
  }

  return levelValidated;
};

/**
 * Generate image name from the map parameters
 *
 * @param {object} center Map center lat,long
 * @param {number} zoom Map zoom level
 * @param {array} markers Marker objects array
 * @param {array} texts Text marker objects array
 *
 * @returns {string} Image name without extension.
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.getImageName = (center, zoom, markers = [], texts = []) => {
  // build array using all the parameters
  const data = [
    center.longitude,
    center.latitude,
    zoom,
  ];
  markers.forEach((marker) => {
    data.push(marker.coord[0]);
    data.push(marker.coord[1]);
    data.push(marker.img);
    data.push(marker.height);
    data.push(marker.width);
    if (marker.offsetX) {
      data.push(marker.offsetX);
    }
    if (marker.offsetY) {
      data.push(marker.offsetY);
    }
  });

  texts.forEach((text) => {
    data.push(text.coord[0]);
    data.push(text.coord[1]);
    data.push(text.text);
    if (text.color) {
      data.push(text.color);
    }
    if (text.width) {
      data.push(text.width);
    }
    if (text.fill) {
      data.push(text.fill);
    }
    if (text.size) {
      data.push(text.size);
    }
    if (text.font) {
      data.push(text.font);
    }
    if (text.anchor) {
      data.push(text.anchor);
    }
  });

  // sort the data
  data.sort();
  return md5(data);
};

/**
 * Get cache directory path
 *
 * @param {string} imageName Map image name
 * @param {boolean} create Create cache directory. Default to false
 *
 * @returns {string} Cache directory path
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.getCacheDirectory = (imageName, create = false) => {
  // use first 8 chars as sub directories with 2 chars for each sub directory
  const dir1 = imageName.substring(0, 2);
  const dir2 = imageName.substring(2, 4);
  const dir3 = imageName.substring(4, 6);
  const dir4 = imageName.substring(6, 8);

  const dir = `${process.env.CACHE_DIRECTORY}${path.sep}${dir1}${path.sep}${dir2}${path.sep}${dir3}${path.sep}${dir4}`;
  if (create) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};
