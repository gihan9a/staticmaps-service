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
    || (typeof size === 'string' && size.trim().length === 0)
  ) {
    return {
      width: parseInt(process.env.IMAGE_WIDTH_DEFAULT, 10),
      height: parseInt(process.env.IMAGE_HEIGHT_DEFAULT, 10),
    };
  }
  const sizeT = size.trim();
  if (!/^\d+[xX]\d+$/.test(sizeT)) {
    throw new Error(
      'Invalid size format. Format should be width x height in integers(without spaces). Eg. 600x400',
    );
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

  return [parseFloat(longitude), parseFloat(latitude)];
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
  // is invalid?
  if (typeof level !== 'string') {
    throw new Error('zoom parameter should be string type');
  }

  if (!/^\d+$/.test(level.trim())) {
    throw new Error(
      'Invalid zoom value. zoom value should be a integer eg. 10',
    );
  }
  const levelValidated = parseInt(level.trim(), 10);

  const zoomMin = parseInt(process.env.ZOOM_MIN, 10);
  const zoomMax = parseInt(process.env.ZOOM_MAX, 10);

  // is not within the range?
  if (!inRange(levelValidated, zoomMin, zoomMax + 1)) {
    throw new Error(
      `Invalid zoom value. zoom should be within ${zoomMin}-${zoomMax}`,
    );
  }

  return levelValidated;
};

/**
 * Serialize coordinates into string
 *
 * @param {array} coords Array of coordinates
 *
 * @returns {string} Serialized string
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const serializeCoords = (coords = []) => coords
  .map((coord) => `${coord[0]},${coord[1]}`)
  .sort()
  .join('|');

/**
 * Serialize markers
 *
 * @param {array} markers Map markers configurations
 *
 * @returns {string} serialize string
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const serializeMarkers = (markers = []) => markers
  .map(
    ({
      coord, img, height, width, offsetX, offsetY,
    }) => `coord:${serializeCoords([
      coord,
    ])},img:${img},height:${height},width:${width},offsetX:${offsetX},offsetY:${offsetY}`,
  )
  .sort()
  .join('|');

/**
 * Serialize lines
 *
 * @param {array} lines Map lines configurations
 *
 * @returns {string} serialize string
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const serializeLines = (lines = []) => lines
  .map(
    ({ coords, color, width }) => `coords:${serializeCoords(coords)},color:${color},width:${width}`,
  )
  .sort()
  .join('|');

/**
 * Serialize texts
 *
 * @param {array} texts Texts array
 *
 * @returns {string} serialize string
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const serializeTexts = (texts = []) => texts
  .map(
    ({
      coord, text, color, width, fill, size, font, anchor,
    }) => `coord:${coord},text:${text},color:${color},width:${width},fill:${fill},size:${size},font:${font},anchor:${anchor}`,
  )
  .sort()
  .join('|');

/**
 * Generate image name from the map parameters
 *
 * @param {array} center Map center [logitude,latitude]
 * @param {string} mimeExt Image MIME extension
 * @param {object} size Map image width and height
 * @param {number} zoom Map zoom level
 * @param {array} markers Marker objects array
 * @param {array} texts Text marker objects array
 *
 * @returns {string} Image name without extension.
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const getImageName = ({
  center = [],
  mimeExt,
  size,
  zoom,
  markers = [],
  texts = [],
  lines = [],
}) => {
  // validate required options
  const required = {
    mimeExt,
    size,
  };

  const keys = Object.keys(required);
  for (let i = 0; i < keys.length; i += 1) {
    if (required[keys[i]] === undefined) {
      throw new Error(`${keys[i]} is required`);
    }
  }

  if (
    center.length === 0
    && markers.length === 0
    && lines.length === 0
    && texts.length === 0
  ) {
    throw new Error(
      'At least center, markers, path or texts parameter is required',
    );
  }

  // build array using all the parameters
  const data = `center{${serializeCoords([center])}}mimeExt{${mimeExt}}size{${
    size.width
  },${size.height}}zoom{${zoom}}markers{${serializeMarkers(
    markers,
  )}}texts{${serializeTexts(texts)}}lines{${serializeLines(lines)}}`;
  return md5(data);
};

/**
 * Get cache directory path
 *
 * @param {string} imageName Map image name
 * @param {boolean} create Create cache directory. Default to true
 *
 * @returns {string} Cache directory path
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const getCacheDirectory = (imageName, create = true) => {
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

const getImageCachePath = (imageName, basePath, mimeExt = 'jpg') => `${basePath}${path.sep}${imageName}.${mimeExt}`;

const isCached = (imagePath) => fs.existsSync(imagePath);

module.exports.getImageCacheData = ({ mimeExt, ...rest }) => {
  const baseName = getImageName({ ...rest, mimeExt });
  const basePath = getCacheDirectory(baseName);
  const imagePath = getImageCachePath(baseName, basePath, mimeExt);

  return {
    path: imagePath,
    basePath,
    baseName,
    isCached: isCached(imagePath),
  };
};

const getContentType = (format) => `image/${format}`;

/**
 * Parse and validate image format.
 * Valid formats are jpg/png/webp
 *
 * @param {string} format Image format
 *
 * @returns {object} Returns {contentType, extension}
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseFormat = (format = '') => {
  if (typeof format !== 'string') {
    throw new Error('format type should be string');
  }

  // if not set send default
  if (format.trim() === '') {
    return {
      contentType: getContentType(process.env.IMAGE_FORMAT_DEFAULT),
      extension: process.env.IMAGE_FORMAT_DEFAULT,
    };
  }

  const formatLower = format.trim().toLowerCase();
  const validFormats = ['jpg', 'png', 'webp'];
  if (!validFormats.includes(formatLower)) {
    throw new Error(
      'Invalid fomat value. Format should be one of jpg, png, webp',
    );
  }
  return {
    contentType: getContentType(formatLower),
    extension: formatLower,
  };
};

/**
 * Get marker icon path
 *
 * @param {string} value Marker color
 *
 * @returns {array} returns Marker icon key and value for marker configuration
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const getMarkerIcon = (value) => {
  // is valid color option
  if (
    ![
      'black',
      'blue',
      'green',
      'orange',
      'purple',
      'red',
      'white',
      'yellow',
    ].includes(value)
  ) {
    throw new Error(`Invalid marker color "${value}"`);
  }

  // get the marker color image
  return ['img', path.resolve(__dirname, `./assets/markers/${value}-32.png`)];
};

/**
 * Validate configuration
 *
 * @param {array} Configuration as array
 *
 * @returns {array} Configuration key and value as array
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidMarkerConfig = ([key, value]) => {
  // basic validate of key and value
  if (!key || !value) {
    throw new Error(`Invalid marker configuration "${key}:${value}"`);
  }

  switch (key) {
    case 'color':
      return getMarkerIcon(value);
    default:
      throw new Error(`Invalid marker configuration "${key}:${value}"`);
  }
};

/**
 * Parse and validate marker configurations
 *
 * @param {array} configs Configs to parse
 *
 * @returns {object} marker configurations
 *
 * @throws Error if configurations fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const parseMarkerConfigs = (configs = []) => {
  const data = {};
  if (configs.length > 0) {
    configs.forEach((config) => {
      const [key, value] = isValidMarkerConfig(config.split(':'));
      data[key] = value;
    });
  }

  // set default configurations if not present
  const imgDefault = path.resolve(
    __dirname,
    `./assets/markers/${process.env.MARKER_COLOR_DEFAULT}-32.png`,
  );
  return {
    width: 32,
    height: 32,
    img: imgDefault,
    ...data,
  };
};

/**
 * Validate marker locations
 *
 * @param {array} locations Marker locations
 *
 * @returns {array} Marker locations
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const parseLocations = (locations) => locations.map((location) => {
  try {
    return this.parseGeoCoordinate(location);
  } catch (err) {
    if (/^Invalid geo coordinate format/.test(err.message)) {
      throw new Error(
        `Invalid location found "${location}". Eg. -12.445,78.12484`,
      );
    }
    throw new Error(`Invalid location found "${location}". ${err.message}`);
  }
});

/**
 * Parse markers query string
 *
 * @param {string} markers Markers query string
 *
 * @returns {array} array of markers
 *
 * @throws Error if markers are invalid
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseMarkers = (markers = '') => {
  // is not string?
  if (typeof markers !== 'string') {
    throw new Error('Markers should be string type');
  }

  // is empty?
  if (markers.trim() === '') {
    return [];
  }

  // split by |
  const options = markers.trim().split('|');
  const locations = options.filter((marker) => /,/.test(marker));
  if (locations.length === 0) {
    throw new Error('No marker locations found');
  }

  // validate geo locations
  const parsedLocations = parseLocations(locations);

  // parse marker configurations
  const configs = parseMarkerConfigs(
    options.filter((marker) => /:/.test(marker)),
  );

  // build final marker configurations
  return parsedLocations.map((location) => ({
    coord: location,
    ...configs,
  }));
};

/**
 * Is valid color for path?
 *
 * @param {string} color 32 bit hex color string or color name
 *
 * @returns {string} color string as 32bit hex number
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidPathColor = (color) => {
  // is 32bit hex?
  if (/^[0-9A-F]{8}$/i.test(color)) {
    return ['color', `#${color.toUpperCase()}`];
  }
  // default path transparancy
  const transparancy = 'BB';
  const validColors = {
    black: `#000000${transparancy}`,
    brown: `#A52A2A${transparancy}`,
    green: `#008000${transparancy}`,
    purple: `#800080${transparancy}`,
    yellow: `#FFFF00${transparancy}`,
    blue: `#0000FF${transparancy}`,
    gray: `#808080${transparancy}`,
    orange: `#FFA500${transparancy}`,
    red: `#FF0000${transparancy}`,
    white: `#FFFFFF${transparancy}`,
  };
  if (validColors[color.trim()]) {
    return ['color', validColors[color.trim()]];
  }
  throw new Error(`Invalid color configuration "color:${color}"`);
};

/**
 * Validate path stroke weight
 *
 * @param {string} weight Path weight as string
 *
 * @returns {array} Returns key/value pair of weight configuration
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidPathWeight = (weight) => {
  if (!/^[0-9]*$/.test(weight)) {
    throw new Error(
      `Invalid weight configuration "weight:${weight}". Should be integer type eg. 4`,
    );
  }
  return ['width', parseInt(weight, 10)];
};

/**
 * Validate path configuration
 *
 * @param {array} Configration as key/value pair
 *
 * @returns {array} Configuration as key/value pair
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidPathConfig = ([key, value]) => {
  // basic validate of key and value
  if (!key || !value) {
    throw new Error(`Invalid path configuration "${key}:${value}"`);
  }

  switch (key) {
    case 'color':
      return isValidPathColor(value);
    case 'weight':
      return isValidPathWeight(value);
    default:
      throw new Error(`Invalid path configuration "${key}:${value}"`);
  }
};

/**
 * Parse path configurations
 *
 * @param {array} configs Configurations as array of strings
 *
 * @returns {object} Path configurations as object
 *
 * @throws Error if validation falils
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const parsePathConfigs = (configs = []) => {
  const data = {};
  if (configs.length > 0) {
    configs.forEach((config) => {
      const [key, value] = isValidPathConfig(config.split(':'));
      data[key] = value;
    });
  }

  // set default configurations if not present
  return {
    color: '#000000BB',
    width: 5,
    ...data,
  };
};

/**
 * Parse path query string
 *
 * @param {string} line Path query string
 *
 * @returns {object} objects
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parsePath = (line = '') => {
  // is not string?
  if (typeof line !== 'string') {
    throw new Error('path should be string type');
  }

  // is empty?
  if (line.trim() === '') {
    return null;
  }

  // split by |
  const options = line.trim().split('|');
  const locations = options.filter((marker) => /,/.test(marker));
  if (locations.length === 0) {
    throw new Error('No path locations found');
  }

  // validate geo locations
  const parsedLocations = parseLocations(locations);
  if (parsedLocations.length < 2) {
    throw new Error('There must be two or more locations to draw a path');
  }

  // parse marker configurations
  const configs = parsePathConfigs(
    options.filter((marker) => /:/.test(marker)),
  );

  // build final marker configurations
  return {
    coords: parsedLocations,
    ...configs,
  };
};
