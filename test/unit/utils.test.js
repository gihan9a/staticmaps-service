const fs = require('fs');
const path = require('path');
const { random } = require('lodash');
const {
  parseSize,
  parseGeoCoordinate,
  parseCenter,
  parseZoom,
  getImageCacheData,
  parseFormat,
  parseMarkers,
  parsePath,
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
      expect(() => {
        parseSize('12');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('12x');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('widthxheight');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize(' 12y45');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('234.4x34');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('234.4x34.62');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('234.434.69');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('234 x 45');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('234 x45');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('-10x20');
      }).toThrow('Invalid size format.');
      expect(() => {
        parseSize('10x-20');
      }).toThrow('Invalid size format.');

      // Invalid size range
      expect(() => {
        parseSize(`${widthMax + 1}x${heightMax + 1}`);
      }).toThrow('Image width should be within');
      expect(() => {
        parseSize(`${widthValid}x${heightMax + 1}`);
      }).toThrow('Image height should be within');
      expect(() => {
        parseSize(`${widthMax + 1}x${heightValid}`);
      }).toThrow('Image width should be within');
      expect(() => {
        parseSize(`${widthMin - 1}x${heightValid}`);
      }).toThrow('Image width should be within');
      expect(() => {
        parseSize(`${widthValid}x${heightMin - 1}`);
      }).toThrow('Image height should be within');
      expect(() => {
        parseSize(`${widthMin - 1}X${heightMin - 1}`);
      }).toThrow('Image width should be within');
    });

    test('parseSize with valid parameters', () => {
      expect(parseSize(`${widthMin}x${heightMin}`)).toStrictEqual({
        width: widthMin,
        height: heightMin,
      });
      expect(parseSize(`${widthMax}X${heightMax}`)).toStrictEqual({
        width: widthMax,
        height: heightMax,
      });
      expect(parseSize(` ${widthMax}X${heightMax}    `)).toStrictEqual({
        width: widthMax,
        height: heightMax,
      });
      // empty value should use default configured image size
      expect(parseSize('')).toStrictEqual({
        width: parseInt(process.env.IMAGE_WIDTH_DEFAULT, 10),
        height: parseInt(process.env.IMAGE_HEIGHT_DEFAULT, 10),
      });
      expect(parseSize()).toStrictEqual({
        width: parseInt(process.env.IMAGE_WIDTH_DEFAULT, 10),
        height: parseInt(process.env.IMAGE_HEIGHT_DEFAULT, 10),
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
      expect(() => {
        parseGeoCoordinate();
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate(' ');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('kf');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('82.124');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('82.124,');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate(',12.344');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('--3.2344,12.344');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('--3.2344,-12.344');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('-3.2344,-12,344');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('-3.2344,-12..344');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseGeoCoordinate('-3.2344,-12.34.4');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');

      // invalid range
      expect(() => {
        parseGeoCoordinate('-91.2344,191.234');
      }).toThrow('Latitude should be within -90 and 90');
      expect(() => {
        parseGeoCoordinate('-91.2344,0.234');
      }).toThrow('Latitude should be within -90 and 90');
      expect(() => {
        parseGeoCoordinate('-9.2344,191.234');
      }).toThrow('Longitude should be within -180 and 180');
    });
    test('test parseGeoCoordinate with valid parameters', () => {
      expect(parseGeoCoordinate('-12.445,78.12484')).toStrictEqual([
        78.12484,
        -12.445,
      ]);
      expect(parseGeoCoordinate('-12.445,-78.12484')).toStrictEqual([
        -78.12484,
        -12.445,
      ]);
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
    const { ZOOM_MIN, ZOOM_MAX } = process.env;
    const zoomMin = parseInt(ZOOM_MIN, 10);
    const zoomMax = parseInt(ZOOM_MAX, 10);
    const zoomValid = random(zoomMin, zoomMax);
    test('test parseZoom with invalid parameters', () => {
      // type test
      expect(() => {
        parseZoom(zoomValid);
      }).toThrow('zoom parameter should be string type');
      expect(() => {
        parseZoom();
      }).toThrow('zoom parameter should be string type');
      expect(() => {
        parseZoom('');
      }).toThrow('Invalid zoom value. zoom value should be a integer eg. 10');
      expect(() => {
        parseZoom(' ');
      }).toThrow('Invalid zoom value. zoom value should be a integer eg. 10');
      expect(() => {
        parseZoom('abc');
      }).toThrow('Invalid zoom value. zoom value should be a integer eg. 10');

      // range test
      expect(() => {
        parseZoom(`${zoomMin - 1}`);
      }).toThrow(
        `Invalid zoom value. zoom should be within ${zoomMin}-${zoomMax}`,
      );
      expect(() => {
        parseZoom(`${zoomMax + 1}`);
      }).toThrow(
        `Invalid zoom value. zoom should be within ${zoomMin}-${zoomMax}`,
      );
      expect(() => {
        parseZoom(`${zoomMin + 0.12}`);
      }).toThrow('Invalid zoom value. zoom value should be a integer eg. 10');
    });
    test('test parseZoom with valid parameters', () => {
      expect(parseZoom(`${zoomValid}`)).toBe(zoomValid);
    });
  });

  const mapParameters1 = {
    mimeExt: 'jpg',
    center: [13.437524, 52.4945528],
    size: { width: 600, height: 400 },
    zoom: 10,
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
    mimeExt: 'jpg',
    center: [13.437524, 52.4945528],
    size: { height: 400, width: 600 },
    zoom: 10,
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
  describe('test getImageCacheData function', () => {
    test('test getImageName', () => {
      expect(getImageCacheData(mapParameters1)).toStrictEqual(
        getImageCacheData(mapParameters2),
      );
    });
    test('test getCacheDirectory', () => {
      const { basePath } = getImageCacheData(mapParameters1);
      expect(fs.existsSync(basePath)).toBe(true);
      // delete directory
      fs.rmdirSync(basePath, { recursive: true });
      expect(fs.existsSync(basePath)).toBe(false);

      // create cache directory
      const { basePath: basePath1 } = getImageCacheData(mapParameters1);
      expect(fs.existsSync(basePath1)).toBe(true);
    });
  });

  // parseFormat function
  describe('test parseFormat function', () => {
    test('test parseFormat with invalid parameters', () => {
      expect(() => {
        parseFormat('jpt');
      }).toThrow('Invalid fomat value. Format should be one of jpg, png, webp');
      expect(() => {
        parseFormat(1);
      }).toThrow('format type should be string');
      expect(() => {
        parseFormat('gif');
      }).toThrow('Invalid fomat value. Format should be one of jpg, png, webp');
    });

    // test with valid
    test('test parseFormat with valid parameters', () => {
      expect(parseFormat('jpg')).toStrictEqual({
        contentType: 'image/jpg',
        extension: 'jpg',
      });
      expect(parseFormat('png')).toStrictEqual({
        contentType: 'image/png',
        extension: 'png',
      });
      expect(parseFormat('webp')).toStrictEqual({
        contentType: 'image/webp',
        extension: 'webp',
      });
    });
  });

  // test parseMarkers function
  describe('test parseMarkers function', () => {
    test('test markersFunction with invalid parameters', () => {
      expect(() => {
        parseMarkers(null);
      }).toThrow('Markers should be string type');
      expect(() => {
        parseMarkers(1);
      }).toThrow('Markers should be string type');
      expect(() => {
        parseMarkers('|');
      }).toThrow('No marker locations found');
      expect(() => {
        parseMarkers('||');
      }).toThrow('No marker locations found');
      expect(() => {
        parseMarkers('|, |');
      }).toThrow('Invalid location found ", ". Eg. -12.445,78.12484');
      expect(() => {
        parseMarkers('62.107733|-145.541936');
      }).toThrow('No marker locations found');
      expect(() => {
        parseMarkers(
          '62.107733,-145.541936|62.107733,-146.54193662.107733,-147.541936|62.107733,-148.541936',
        );
      }).toThrow(
        'Invalid location found "62.107733,-146.54193662.107733,-147.541936". Eg. -12.445,78.12484',
      );
      expect(() => {
        parseMarkers('-145.541936');
      }).toThrow('No marker locations found');
      expect(() => {
        parseMarkers('color:red');
      }).toThrow('No marker locations found');
      expect(() => {
        parseMarkers('62.107733,-195.541936');
      }).toThrow(
        'Invalid location found "62.107733,-195.541936". Longitude should be within -180 and 180',
      );
      expect(() => {
        parseMarkers('62.107733,-145.541936|92.107733,-145.541936');
      }).toThrow(
        'Invalid location found "92.107733,-145.541936". Latitude should be within -90 and 90',
      );
      expect(() => {
        parseMarkers('||62.107733,-145.541936|92.107733,-145.541936');
      }).toThrow(
        'Invalid location found "92.107733,-145.541936". Latitude should be within -90 and 90',
      );

      // marker configurations
      expect(() => {
        parseMarkers('style:none62.107733,-145.541936');
      }).toThrow(
        'Invalid location found "style:none62.107733,-145.541936". Eg. -12.445,78.12484',
      );
      expect(() => {
        parseMarkers('style:none|62.107733,-145.541936');
      }).toThrow('Invalid marker configuration "style:none"');
      expect(() => {
        parseMarkers('color:|62.107733,-145.541936');
      }).toThrow('Invalid marker configuration "color:"');
      expect(() => {
        parseMarkers('color:none|62.107733,-145.541936');
      }).toThrow('Invalid marker color "none"');
    });
    test('test markersFunction with valid parameters', () => {
      expect(parseMarkers(undefined)).toStrictEqual([]);
      const markerColorDefault = process.env.MARKER_COLOR_DEFAULT;
      expect(parseMarkers('62.107733,-145.541936')).toStrictEqual([
        {
          coord: [-145.541936, 62.107733],
          img: path.resolve(
            __dirname,
            `../../assets/markers/${markerColorDefault}-32.png`,
          ),
          height: 32,
          width: 32,
        },
      ]);
      expect(parseMarkers('color:red|62.107733,-145.541936')).toStrictEqual([
        {
          coord: [-145.541936, 62.107733],
          img: path.resolve(__dirname, '../../assets/markers/red-32.png'),
          height: 32,
          width: 32,
        },
      ]);
    });
  });

  // test parsePath
  describe('test parsePath function', () => {
    test('test parsePath with invalid parameters', () => {
      expect(() => {
        parsePath(1);
      }).toThrow('path should be string type');
      expect(() => {
        parsePath(null);
      }).toThrow('path should be string type');
      expect(() => {
        parsePath('52.482659');
      }).toThrow('No path locations found');
      expect(() => {
        parsePath('52.482659,');
      }).toThrow('Invalid location found "52.482659,". Eg. -12.445,78.12484');
      expect(() => {
        parsePath(',52.482659');
      }).toThrow('Invalid location found ",52.482659". Eg. -12.445,78.12484');
      expect(() => {
        parsePath('52482659,52.482659');
      }).toThrow(
        'Invalid location found "52482659,52.482659". Latitude should be within -90 and 90',
      );
      expect(() => {
        parsePath('||');
      }).toThrow('No path locations found');
      expect(() => {
        parsePath('color:none| 52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid color configuration "color:none"');
      expect(() => {
        parsePath('color:F83A0089| 52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid color configuration "color:F83A0089"');
      expect(() => {
        parsePath('color:#S83A0089| 52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid color configuration "color:#S83A0089"');
      expect(() => {
        parsePath('color:#F83A00| 52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid color configuration "color:#F83A00"');
      expect(() => {
        parsePath('weight:|52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid path configuration "weight:"');
      expect(() => {
        parsePath('weight:string|52.482659,52.482659|62.107733,-145.541936');
      }).toThrow(
        'Invalid weight configuration "weight:string". Should be integer type eg. 4',
      );
      expect(() => {
        parsePath('weight:3.3|52.482659,52.482659|62.107733,-145.541936');
      }).toThrow(
        'Invalid weight configuration "weight:3.3". Should be integer type eg. 4',
      );
      expect(() => {
        parsePath('color:|weight:3|52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid path configuration "color:"');
      expect(() => {
        parsePath(
          'color:red|weight:|52.482659,52.482659|62.107733,-145.541936',
        );
      }).toThrow('Invalid path configuration "weight:"');
      expect(() => {
        parsePath('52.482659,13.399259');
      }).toThrow('There must be two or more locations to draw a path');
      // @tood test weight boundary values
    });
    test('test parsePath with valid parameters', () => {
      expect(parsePath()).toStrictEqual(null);
      expect(parsePath('')).toStrictEqual(null);
      expect(parsePath(' ')).toStrictEqual(null);
      expect(
        parsePath('color:#F83A0089|52.482659,13.399259|62.107733,-145.541936'),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [-145.541936, 62.107733],
        ],
        color: '#F83A0089',
        width: 5,
      });
      expect(
        parsePath('color:#F83A0089| 52.482659,13.399259| 62.107733,-145.541936'),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [-145.541936, 62.107733],
        ],
        color: '#F83A0089',
        width: 5,
      });
      expect(
        parsePath(
          'weight:1| 52.482659,13.399259| 62.107733,-145.541936 | 53.482659,14.399259',
        ),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [-145.541936, 62.107733],
          [14.399259, 53.482659],
        ],
        color: '#000000BB',
        width: 1,
      });
      expect(
        parsePath(
          'weight:1|color:#F83A0089| 52.482659,13.399259| 62.107733,-145.541936',
        ),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [-145.541936, 62.107733],
        ],
        color: '#F83A0089',
        width: 1,
      });
    });
  });
});
