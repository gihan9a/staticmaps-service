const fs = require('fs');
const { random } = require('lodash');
const {
  parseSize,
  parseGeoCoordinate,
  parseCenter,
  parseZoom,
  getImageName,
  getCacheDirectory,
} = require('../../utils');

describe('Test utils.js functions', () => {
  // parseSize
  describe('Test parseSize function', () => {
    const widthMax = parseInt(process.env.IMAGE_WIDTH_MAX, 10);
    const widthMin = parseInt(process.env.IMAGE_WIDTH_MIN, 10);
    const heightMax = parseInt(process.env.IMAGE_HEIGHT_MAX, 10);
    const heightMin = parseInt(process.env.IMAGE_HEIGHT_MIN, 10);
    const widthValid = random(widthMax, widthMin);
    const heightValid = random(heightMin, heightMax);
    test('test parseSize existance', () => {
      expect(typeof parseSize === 'function').toBe(true);
    });
    test('parseSize with invalid parameters', () => {
      expect(() => { parseSize('12'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('12x'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('widthxheight'); }).toThrow('Invalid size format.');
      expect(() => { parseSize(' 12y45'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('234.4x34'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('234.4x34.62'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('234.434.69'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('234 x 45'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('234 x45'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('-10x20'); }).toThrow('Invalid size format.');
      expect(() => { parseSize('10x-20'); }).toThrow('Invalid size format.');

      // Invalid size range
      expect(() => { parseSize(`${widthMax + 1}x${heightMax + 1}`); }).toThrow('Image width should be within');
      expect(() => { parseSize(`${widthValid}x${heightMax + 1}`); }).toThrow('Image height should be within');
      expect(() => { parseSize(`${widthMax + 1}x${heightValid}`); }).toThrow('Image width should be within');
      expect(() => { parseSize(`${widthMin - 1}x${heightValid}`); }).toThrow('Image width should be within');
      expect(() => { parseSize(`${widthValid}x${heightMin - 1}`); }).toThrow('Image height should be within');
      expect(() => { parseSize(`${widthMin - 1}X${heightMin - 1}`); }).toThrow('Image width should be within');
    });

    test('parseSize with valid parameters', () => {
      expect(parseSize(`${widthMin}x${heightMin}`)).toStrictEqual({ width: widthMin, height: heightMin });
      expect(parseSize(`${widthMax}X${heightMax}`)).toStrictEqual({ width: widthMax, height: heightMax });
      expect(parseSize(` ${widthMax}X${heightMax}    `)).toStrictEqual({ width: widthMax, height: heightMax });
      // empty value should use default configured image size
      expect(parseSize('')).toStrictEqual({
        width: parseInt(process.env.IMAGE_WIDTH, 10),
        height: parseInt(process.env.IMAGE_HEIGHT, 10),
      });
      expect(parseSize()).toStrictEqual({
        width: parseInt(process.env.IMAGE_WIDTH, 10),
        height: parseInt(process.env.IMAGE_HEIGHT, 10),
      });
    });
  });
  // parseGeoCoordinate
  describe('test parseGeoCoordinate function', () => {
    test('test parseGeoCoordinate existance', () => {
      expect(typeof parseGeoCoordinate === 'function').toBe(true);
    });
    test('test parseGeoCoordinate with invalid parameters', () => {
      // invalid format
      expect(() => { parseGeoCoordinate(); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate(' '); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('kf'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('82.124'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('82.124,'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate(',12.344'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('--3.2344,12.344'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('--3.2344,-12.344'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('-3.2344,-12,344'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('-3.2344,-12..344'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => { parseGeoCoordinate('-3.2344,-12.34.4'); }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');

      // invalid range
      expect(() => { parseGeoCoordinate('-91.2344,191.234'); }).toThrow('Latitude should be within -90 and 90');
      expect(() => { parseGeoCoordinate('-91.2344,0.234'); }).toThrow('Latitude should be within -90 and 90');
      expect(() => { parseGeoCoordinate('-9.2344,191.234'); }).toThrow('Longitude should be within -180 and 180');
    });
    test('test parseGeoCoordinate with valid parameters', () => {
      expect(parseGeoCoordinate('-12.445,78.12484')).toStrictEqual({ latitude: -12.445, longitude: 78.12484 });
      expect(parseGeoCoordinate('-12.445,-78.12484')).toStrictEqual({ latitude: -12.445, longitude: -78.12484 });
    });
  });
  // parseCenter
  describe('test parseCenter function', () => {
    // parseCenter is exactly same as parseGeoCoordinate
    test('test parseCenter existance', () => {
      expect(typeof parseCenter === 'function').toBe(true);
    });
  });

  describe('test parseZoom function', () => {
    test('test parseZoom existance', () => {
      expect(typeof parseZoom === 'function').toBe(true);
    });
    const { ZOOM_MIN, ZOOM_MAX, ZOOM_DEFAULT } = process.env;
    const zoomMin = parseInt(ZOOM_MIN, 10);
    const zoomMax = parseInt(ZOOM_MAX, 10);
    const zoomValid = random(zoomMin, zoomMax);
    test('test parseZoom with invalid parameters', () => {
      // type test
      expect(() => { parseZoom(zoomValid); }).toThrow('zoom parameter should be string type');
      expect(() => { parseZoom('abc'); }).toThrow('Invalid zoom value. zoom value should be a integer eg. 10');

      // range test
      expect(() => { parseZoom(`${zoomMin - 1}`); }).toThrow(`Invalid zoom value. zoom should be within ${zoomMin}-${zoomMax}`);
      expect(() => { parseZoom(`${zoomMax + 1}`); }).toThrow(`Invalid zoom value. zoom should be within ${zoomMin}-${zoomMax}`);
      expect(() => { parseZoom(`${zoomMin + 0.12}`); }).toThrow('Invalid zoom value. zoom value should be a integer eg. 10');
    });
    test('test parseZoom with valid parameters', () => {
      expect(parseZoom()).toBe(parseInt(ZOOM_DEFAULT, 10));
      expect(parseZoom('')).toBe(parseInt(ZOOM_DEFAULT, 10));
      expect(parseZoom(' ')).toBe(parseInt(ZOOM_DEFAULT, 10));
      expect(parseZoom(`${zoomValid}`)).toBe(zoomValid);
    });
  });

  const mapParameters1 = {
    center: [13.437524, 52.4945528],
    size: { width: 600, height: 400 },
    zoom: parseZoom(),
    markers: [
      {
        img: 'http://exmple.com/marker.png', // can also be a URL
        offsetX: 24,
        offsetY: 48,
        width: 48,
        height: 48,
        coord: [13.437524, 52.4945528],
      },
      {
        img: 'http://exmple.com/marker.png', // can also be a URL
        offsetX: 24,
        offsetY: 48,
        width: 48,
        height: 48,
        coord: [13.430524, 52.4995528],
      },
    ],
    texts: [
      {
        coord: [13.437524, 52.4945528],
        text: 'My Text',
        size: 50,
        width: '1px',
        fill: '#000000',
        color: '#ffffff',
        font: 'Calibri',
      },
      {
        coord: [13.430524, 52.4995528],
        text: 'My Text 2',
        size: 50,
        width: '1px',
        fill: '#000000',
        color: '#ffffff',
        font: 'Calibri',
      },
    ],
  };
  // mapParameters2 is same as mapParameters1, just the order of properties are not same
  const mapParameters2 = {
    center: [13.437524, 52.4945528],
    size: { height: 400, width: 600 },
    zoom: parseZoom(),
    markers: [
      {
        coord: [13.430524, 52.4995528],
        offsetX: 24,
        img: 'http://exmple.com/marker.png', // can also be a URL
        width: 48,
        height: 48,
        offsetY: 48,
      },
      {
        img: 'http://exmple.com/marker.png', // can also be a URL
        offsetY: 48,
        offsetX: 24,
        coord: [13.437524, 52.4945528],
        height: 48,
        width: 48,
      },
    ],
    texts: [
      {
        font: 'Calibri',
        text: 'My Text',
        size: 50,
        coord: [13.437524, 52.4945528],
        fill: '#000000',
        width: '1px',
        color: '#ffffff',
      },
      {
        size: 50,
        coord: [13.430524, 52.4995528],
        color: '#ffffff',
        text: 'My Text 2',
        width: '1px',
        fill: '#000000',
        font: 'Calibri',
      },
    ],
  };

  // getImageName test
  describe('test getImageName function', () => {
    test('test getImageName', () => {
      const {
        size: size1, center: center1, zoom: zoom1, markers: markers1, texts: texts1,
      } = mapParameters1;
      const {
        size: size2, center: center2, zoom: zoom2, markers: markers2, texts: texts2,
      } = mapParameters2;
      expect(getImageName(size1, center1, zoom1, markers1, texts1))
        .toBe(getImageName(size2, center2, zoom2, markers2, texts2));
    });
  });

  // test get cache directory name
  describe('test getCacheDirectory function', () => {
    test('test getCacheDirectory', () => {
      const {
        size, center, zoom, markers, texts,
      } = mapParameters1;
      const imageName = getImageName(size, center, zoom, markers, texts);

      const dir = getCacheDirectory(imageName);

      // delete if directory already exists
      if (fs.existsSync(dir)) {
        // delete directory
        fs.rmdirSync(dir, { recursive: true });
        expect(fs.existsSync(dir)).toBe(false);
      }

      // create cache directory
      getCacheDirectory(imageName, true);
      expect(fs.existsSync(dir)).toBe(true);
    });
  });
});
