const {
  parseSize,
  parseGeoCoordinate,
  parseCenter,
} = require('../../utils');

describe('Test utils.js functions', () => {
  // parseSize
  describe('Test parseSize function', () => {
    const widthMax = parseInt(process.env.IMAGE_WIDTH_MAX, 10);
    const widthMin = parseInt(process.env.IMAGE_WIDTH_MIN, 10);
    const heightMax = parseInt(process.env.IMAGE_HEIGHT_MAX, 10);
    const heightMin = parseInt(process.env.IMAGE_HEIGHT_MIN, 10);
    const widthValid = Math.floor(Math.random() * (widthMax - widthMin + 1)) + widthMin;
    const heightValid = Math.floor(Math.random() * (heightMax - heightMin + 1)) + heightMin;
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
});
