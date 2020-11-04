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
    ({
      coords, color, width, fill,
    }) => `coords:${serializeCoords(
      coords,
    )},color:${color},width:${width},fill:${fill}`,
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

module.exports.getContentType = (format) => `image/${format}`;

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
      contentType: this.getContentType(process.env.IMAGE_FORMAT_DEFAULT),
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
    contentType: this.getContentType(formatLower),
    extension: formatLower,
  };
};

/**
 * Color name/hex map and swap
 *
 * @param {string} value Color value
 * @param {boolean} swap Swap the color name/hex
 *
 * @returns {string} Returns color name/hex
 *
 * @throws Error if unsupported color found
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const colorHexMap = (value, swap = false) => {
  // default path transparancy
  const transparancy = 'BB';
  const colorHex = {
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

  // is color name given?
  if (colorHex[value]) {
    return swap ? colorHex[value] : value;
  }

  // is color hex value given?
  if (/^#[0-9A-F]{8}$/i.test(value)) {
    // swap the colorHex map
    const hexColor = Object.keys(colorHex).reduce((obj, key) => {
      // eslint-disable-next-line no-param-reassign
      obj[colorHex[key]] = key;
      return obj;
    }, {});
    if (hexColor[value]) {
      return swap ? hexColor[value] : value;
    }
  }

  throw new Error('Unsupported color');
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
  const color = colorHexMap(value, true);

  // get the marker color image
  return ['img', path.resolve(__dirname, `./assets/markers/${color}-32.png`)];
};

/**
 * Is valid color?
 *
 * @param {string} color 32 bit hex color string or color name
 * @param {string} key Color key used in configuration
 * @param {string} queryKey Color key used in query configuration
 *
 * @returns {string} color string as 32bit hex number
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidColor = (color, key, queryKey) => {
  // is 32bit hex?
  if (/^[0-9A-F]{8}$/i.test(color)) {
    return [key, `#${color.toUpperCase()}`];
  }

  try {
    return [key, colorHexMap(color.trim(), true)];
  } catch (err) {
    throw new Error(`Invalid ${queryKey} configuration "${queryKey}:${color}"`);
  }
};

/**
 * Validate stroke weight
 *
 * @param {string} weight Stroke weight as string
 *
 * @returns {array} Returns key/value pair of weight configuration
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidWeight = (weight) => {
  if (!/^[0-9]*$/.test(weight)) {
    throw new Error(
      `Invalid weight configuration "weight:${weight}". Should be integer type eg. 4`,
    );
  }
  return ['width', parseInt(weight, 10)];
};

/**
 * Is valid font family
 *
 * @param {string} value Font family name
 *
 * @returns {array} Font key/value configuration
 *
 * @throws Error Returns error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidFont = (value) => {
  const valid = ['Arial', 'Times New Roman', 'Courier New'];
  if (!valid.includes(value.trim())) {
    throw new Error(`Invalid font configuration "font:${value}"`);
  }
  return ['font', value.trim()];
};

/**
 * Validate font size
 *
 * @param {string} value Font size
 *
 * @returns {array} Font size configuration as key/value pair
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidFontSize = (value) => {
  if (!/^[0-9]*$/.test(value.trim())) {
    throw new Error(`Invalid fontsize configuration "fontsize:${value}"`);
  }
  return ['size', parseInt(value.trim(), 10)];
};

/**
 * Is valid anchor configuration?
 *
 * @param {string} value Anchor value
 *
 * @returns {array} Anchor configuration as key/value pair
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidAnchor = (value) => {
  const valid = [
    'start',
    'middle',
    'end',
  ];

  const val = value.trim().toLowerCase();
  if (!valid.includes(val)) {
    throw new Error(`Invalid anchor configuration "anchor:${value}"`);
  }

  return ['anchor', val];
};

/**
 * Validate text description
 *
 * @param {string} value Text description
 * @param {string} key Key used for library
 * @param {string} queryKey API query key
 *
 * @returns {array} Returns text configuration as key/value pair
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidTextValue = (value, key, queryKey) => {
  const val = value.trim();
  if (!/^[\w\s-]*$/.test(value)) {
    throw new Error(`Invalid ${queryKey} configuration "${queryKey}:${value}"`);
  }

  return [key, val];
};

/**
 * Validate configuration
 *
 * @param {string} type Configuration owner
 * @param {array} param1 Cofiguration key/value pair
 *
 * @returns {array} Configuration as key/value pair
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const isValidConfig = (type, [key, value]) => {
  // basic validate of key and value
  if (!key || !value) {
    throw new Error(`Invalid ${type} configuration "${key}:${value}"`);
  }

  switch (key) {
    case 'color': {
      const ans = isValidColor(value, 'color', key);
      if (type === 'marker') {
        return getMarkerIcon(ans[1]);
      }
      return ans;
    }
    case 'weight':
      return isValidWeight(value, 'weight', key);
    case 'fillcolor':
      return isValidColor(value, 'fill', key);
    case 'content':
      return isValidTextValue(value, 'text', key);
    case 'font':
      return isValidFont(value, 'font', key);
    case 'fontsize':
      return isValidFontSize(value, 'size', key);
    case 'anchor':
      return isValidAnchor(value, 'anchor', key);
    default:
      throw new Error(`Invalid ${type} configuration "${key}:${value}"`);
  }
};

/**
 * Parse configurations of the query string
 *
 * @param {string} type Configurations owner
 * @param {array} configs Configurations as key/value pair
 * @param {object} defaults Default configurations
 *
 * @returns {object} Returns configurations as key/value object
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const parseConfigs = (type, configs = [], defaults = {}) => {
  const data = {};
  if (configs.length > 0) {
    configs.forEach((config) => {
      const [key, value] = isValidConfig(type, config.split(':'));
      data[key] = value;
    });
  }
  return {
    ...defaults,
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
  // default marker icon
  const imgDefault = path.resolve(
    __dirname,
    `./assets/markers/${process.env.MARKER_COLOR_DEFAULT}-32.png`,
  );

  // parse marker configurations
  const configs = parseConfigs(
    'marker',
    options.filter((marker) => /:/.test(marker)),
    {
      width: 32,
      height: 32,
      img: imgDefault,
    },
  );

  // build final marker configurations
  return parsedLocations.map((location) => ({
    coord: location,
    ...configs,
  }));
};

/**
 * Are first and last locations same in the given array?
 *
 * @param {array} locations Geo locations coord array
 *
 * @returns {boolean} Returns true if they are same, false otherwise
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
const areFirstAndLastCoordsSame = (locations = []) => {
  const first = locations[0];
  const last = locations[locations.length - 1];
  return first[0] === last[0] && first[1] === last[1];
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
  const locations = options.filter((option) => /,/.test(option));
  if (locations.length === 0) {
    throw new Error('No path locations found');
  }

  // validate geo locations
  const parsedLocations = parseLocations(locations);
  if (parsedLocations.length < 2) {
    throw new Error('There must be two or more locations to draw a path');
  }

  // parse path configurations
  const configs = parseConfigs(
    'path',
    options.filter((option) => /:/.test(option)),
    {
      color: process.env.PATH_COLOR_DEFAULT,
      width: 5,
    },
  );

  // has not set `fillcolor` but first and last locations are same?
  if (
    configs.fill === undefined
    && parsedLocations.length > 2
    && areFirstAndLastCoordsSame(parsedLocations)
  ) {
    // add default fill color
    configs.fill = process.env.POLYGON_FILL_COLOR_DEFAULT;
  } else if (configs.fill && parsedLocations.length === 2) {
    // there are enough locations to draw a polygon
    // remove fill color
    delete configs.fill;
  }

  // build final path configurations
  return {
    coords: parsedLocations,
    ...configs,
  };
};

/**
 * Parse text query string
 *
 * @param {string} texts Text query string
 *
 * @returns {object} Text configurations
 *
 * @throws Error if validation fails
 *
 * @author Gihan S <gihanshp@gmail.com>
 */
module.exports.parseText = (texts = '') => {
  // is not string?
  if (typeof texts !== 'string') {
    throw new Error('text should be string type');
  }

  // is empty?
  if (texts.trim() === '') {
    return null;
  }

  // split by |
  const options = texts.trim().split('|');
  const locations = options.filter((option) => /,/.test(option));
  if (locations.length === 0) {
    throw new Error('No text location found');
  }

  // validate geo locations
  const parsedLocations = parseLocations(locations);
  if (parsedLocations.length > 1) {
    throw new Error('Multiple locations found as text location');
  }

  // parse text configurations
  const configs = parseConfigs(
    'text',
    options.filter((option) => /:/.test(option)),
    {
      size: process.env.TEXT_SIZE,
      width: process.env.TEXT_WIDTH,
      fill: process.env.TEXT_FILL_COLOR,
      color: process.env.TEXT_COLOR,
      font: process.env.TEXT_FONT,
      anchor: 'middle',
    },
  );

  // content configuration is required
  if (configs.text === undefined) {
    throw new Error('content configuration is required');
  }

  // build final text configurations
  return {
    coord: parsedLocations[0],
    ...configs,
  };
};
