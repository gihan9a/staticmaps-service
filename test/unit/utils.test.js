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
  parseText,
  getContentType,
} = require('../../utils');

describe('Test utils.js functions', () => {
  describe('test getContentType function', () => {
    test('getContentType with invalid arguments', () => {
      expect(() => { getContentType(); }).toThrow('Invalid format value. format should be one of "jpg", "png", "webp"');
      expect(() => { getContentType(12); }).toThrow('format should be string type');
    });
  });
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
    const parseSizeError0 = 'size is required';
    const parseSizeError1 = 'Invalid size. size should be <width>x<height> in integers. Eg. 600x400';
    const parseSizeError2 = `Image width should be within ${widthMin}-${widthMax}`;
    const parseSizeError3 = `Image height should be within ${heightMin}-${heightMax}`;
    test.each([
      [undefined, parseSizeError0],
      ['', parseSizeError0],
      [' ', parseSizeError0],
      ['12', parseSizeError1],
      ['12x', parseSizeError1],
      ['widthxheight', parseSizeError1],
      [' 12y45', parseSizeError1],
      ['234.4x34', parseSizeError1],
      ['234.4x34.62', parseSizeError1],
      ['234.434.69', parseSizeError1],
      ['234 x 45', parseSizeError1],
      ['234 x45', parseSizeError1],
      ['-10x20', parseSizeError1],
      ['10x-20', parseSizeError1],
      [`${widthMax + 1}x${heightMax + 1}`, parseSizeError2],
      [`${widthValid}x${heightMax + 1}`, parseSizeError3],
      [`${widthMax + 1}x${heightValid}`, parseSizeError2],
      [`${widthValid}x${heightMin - 1}`, parseSizeError3],
      [`${widthMin - 1}X${heightMin - 1}`, parseSizeError2],
      [12, 'size should be string type'],
    ])('invalid arguments for parseSize(%s)', (input, expcted) => {
      expect(() => { parseSize(input); }).toThrow(expcted);
    });

    test('parseSize with valid arguments', () => {
      expect(parseSize(`${widthMin}x${heightMin}`)).toStrictEqual([widthMin, heightMin]);
      expect(parseSize(`${widthMax}X${heightMax}`)).toStrictEqual([widthMax, heightMax]);
      expect(parseSize(` ${widthMax}X${heightMax}    `)).toStrictEqual([widthMax, heightMax]);
    });
  });

  // parseGeoCoordinate
  describe('test parseGeoCoordinate function', () => {
    test('test parseGeoCoordinate existance', () => {
      expect(typeof parseGeoCoordinate === 'function').toBe(true);
    });
    test('test parseGeoCoordinate with invalid arguments', () => {
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
    test('test parseGeoCoordinate with valid arguments', () => {
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
    test('test parseCenter with invalid arguments', () => {
      expect(() => {
        parseCenter(10);
      }).toThrow('center should be string type');
      expect(() => {
        parseCenter('10');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseCenter('10|15');
      }).toThrow('Invalid geo coordinate format. Eg. -12.445,78.12484');
      expect(() => {
        parseCenter('100,190');
      }).toThrow('Latitude should be within -90 and 90');
      expect(() => {
        parseCenter('10,190');
      }).toThrow('Longitude should be within -180 and 180');
    });
    test('test parseCenter with valid arguments', () => {
      expect(parseCenter()).toStrictEqual([]);
      expect(parseCenter('')).toStrictEqual([]);
      expect(parseCenter(' ')).toStrictEqual([]);
      expect(parseCenter('62.107733,-145.541936')).toStrictEqual([
        -145.541936,
        62.107733,
      ]);
      expect(parseCenter('', [-145.541936, 62.107733])).toStrictEqual([
        -145.541936,
        62.107733,
      ]);
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
    test('test parseZoom with invalid arguments', () => {
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
    test('test parseZoom with valid arguments', () => {
      expect(parseZoom(`${zoomValid}`)).toBe(zoomValid);
    });
  });

  const mapParameters1 = {
    format: 'jpg',
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
        width: 1,
        fill: '#000000',
        color: '#ffffff',
        font: 'Calibri',
      },
      {
        coord: [13.430524, 52.4995528],
        text: 'My Text 2',
        size: 50,
        width: 1,
        fill: '#000000',
        color: '#ffffff',
        font: 'Calibri',
      },
    ],
    lines: [
      {
        coords: [
          [13.437524, 52.4945528],
          [14.437524, 52.4945528],
          [15.437524, 53.4945528],
        ],
        color: '#ffffffff',
        width: 1,
        fill: '#00000088',
      },
    ],
  };
  // mapParameters2 is same as mapParameters1, just the order of properties are not same
  const mapParameters2 = {
    format: 'jpg',
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
        width: 1,
        color: '#ffffff',
      },
      {
        size: 50,
        coord: [13.430524, 52.4995528],
        color: '#ffffff',
        text: 'My Text 2',
        width: 1,
        fill: '#000000',
        font: 'Calibri',
      },
    ],
    lines: [
      {
        coords: [
          [13.437524, 52.4945528],
          [14.437524, 52.4945528],
          [15.437524, 53.4945528],
        ],
        fill: '#00000088',
        width: 1,
        color: '#ffffffff',
      },
    ],
  };

  // getImageName test
  describe('test getImageCacheData function', () => {
    test('test getImageCacheData with invalid arguments', () => {
      expect(() => {
        getImageCacheData({});
      }).toThrow('format is required');
      expect(() => {
        getImageCacheData({ format: 'jpg' });
      }).toThrow('size is required');
      expect(() => {
        getImageCacheData({ format: 'jpg', size: '100x200' });
      }).toThrow(
        'At least center, markers, path or text parameter is required',
      );
      expect(() => {
        getImageCacheData({ format: 'jpg', size: '100x200', markers: null });
      }).toThrow('markers should be a array');
      expect(() => {
        getImageCacheData({
          format: 'jpg',
          size: '100x200',
          markers: undefined,
        });
      }).toThrow(
        'At least center, markers, path or text parameter is required',
      );
      expect(() => {
        getImageCacheData({ format: 'jpg', size: '100x200', texts: null });
      }).toThrow('texts should be a array');
      expect(() => {
        getImageCacheData({
          format: 'jpg',
          size: '100x200',
          texts: undefined,
        });
      }).toThrow(
        'At least center, markers, path or text parameter is required',
      );
      expect(() => {
        getImageCacheData({ format: 'jpg', size: '100x200', lines: null });
      }).toThrow('lines should be a array');
      expect(() => {
        getImageCacheData({
          format: 'jpg',
          size: '100x200',
          lines: undefined,
        });
      }).toThrow(
        'At least center, markers, path or text parameter is required',
      );
    });
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
    test('test parseFormat with invalid arguments', () => {
      expect(() => {
        parseFormat('jpt');
      }).toThrow('Invalid format value. format should be one of "jpg", "png", "webp"');
      expect(() => {
        parseFormat(1);
      }).toThrow('format type should be string');
      expect(() => {
        parseFormat('gif');
      }).toThrow('Invalid format value. format should be one of "jpg", "png", "webp"');
    });

    // test with valid
    test('test parseFormat with valid arguments', () => {
      expect(parseFormat()).toStrictEqual(process.env.IMAGE_FORMAT_DEFAULT);
      expect(parseFormat('jpg')).toStrictEqual('jpg');
      expect(parseFormat('png')).toStrictEqual('png');
      expect(parseFormat('webp')).toStrictEqual('webp');
    });
  });

  // test parseMarkers function
  describe('test parseMarkers function', () => {
    test('test markersFunction with invalid arguments', () => {
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
      }).toThrow('Invalid color configuration "color:none"');
    });
    test('test markersFunction with valid arguments', () => {
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
    test('test parsePath with invalid arguments', () => {
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
        parsePath('color:#F83A0089| 52.482659,52.482659|62.107733,-145.541936');
      }).toThrow('Invalid color configuration "color:#F83A0089"');
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
          'fillcolor:|weight:3|52.482659,52.482659|62.107733,-145.541936',
        );
      }).toThrow('Invalid path configuration "fillcolor:"');
      expect(() => {
        parsePath(
          'fillcolor:WASDGWEE|weight:3|52.482659,52.482659|62.107733,-145.541936',
        );
      }).toThrow('Invalid fillcolor configuration "fillcolor:WASDGWEE"');
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
    test('test parsePath with valid arguments', () => {
      expect(parsePath()).toStrictEqual(null);
      expect(parsePath('')).toStrictEqual(null);
      expect(parsePath(' ')).toStrictEqual(null);
      expect(
        parsePath('color:F83A0089|52.482659,13.399259|62.107733,-145.541936'),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [-145.541936, 62.107733],
        ],
        color: '#F83A0089',
        width: 5,
      });
      expect(
        parsePath('color:F83A0089| 52.482659,13.399259| 62.107733,-145.541936'),
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
          'weight:1|color:F83A0089| 52.482659,13.399259| 62.107733,-145.541936',
        ),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [-145.541936, 62.107733],
        ],
        color: '#F83A0089',
        width: 1,
      });

      // test polygons
      expect(
        parsePath(
          'weight:1|fillcolor:F83A0089| 52.482659,13.399259| 62.107733,14.541936',
        ),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [14.541936, 62.107733],
        ],
        color: process.env.PATH_COLOR_DEFAULT,
        width: 1,
      });
      expect(
        parsePath(
          'weight:1|fillcolor:F83A0089| 52.482659,13.399259| 62.107733,14.541936|52.412659,13.499259',
        ),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [14.541936, 62.107733],
          [13.499259, 52.412659],
        ],
        color: process.env.PATH_COLOR_DEFAULT,
        fill: '#F83A0089',
        width: 1,
      });
      expect(
        parsePath(
          'weight:1|color:F83A0089| 52.482659,13.399259| 62.107733,14.541936|52.412659,13.499259|52.482659,13.399259',
        ),
      ).toStrictEqual({
        coords: [
          [13.399259, 52.482659],
          [14.541936, 62.107733],
          [13.499259, 52.412659],
          [13.399259, 52.482659],
        ],
        fill: process.env.POLYGON_FILL_COLOR_DEFAULT,
        color: '#F83A0089',
        width: 1,
      });
    });
  });

  describe('test parseText function', () => {
    test('test parseText with invalid arguments', () => {
      expect(() => {
        parseText(12);
      }).toThrow('text should be string type');
      expect(() => {
        parseText('content:|62.107733,14.541936');
      }).toThrow('Invalid text configuration "content:"');
      expect(() => {
        parseText('size:4|62.107733,14.541936');
      }).toThrow('Invalid text configuration "size:4"');
      expect(() => {
        parseText('fontsize:4|62.107733,14.541936');
      }).toThrow('content configuration is required');
      expect(() => {
        parseText('content:Hello$|62.107733,14.541936');
      }).toThrow('Invalid content configuration "content:Hello$"');
      expect(() => {
        parseText('content:Hello|fillcolor:butter');
      }).toThrow('No text location found');
      expect(() => {
        parseText('content:Hello|62.107733,14.541936|52.482659,13.399259');
      }).toThrow('Multiple locations found as text location');
      expect(() => {
        parseText('content:Hello|color:butter|62.107733,14.541936');
      }).toThrow('Invalid color configuration "color:butter"');
      expect(() => {
        parseText('content:Hello|size:small|62.107733,14.541936');
      }).toThrow('Invalid text configuration "size:small"');
      expect(() => {
        parseText('content:Hello|font:Impact|62.107733,14.541936');
      }).toThrow('Invalid font configuration "font:Impact"');
      expect(() => {
        parseText('content:Hello|anchor:top|62.107733,14.541936');
      }).toThrow('Invalid anchor configuration "anchor:top"');
      expect(() => {
        parseText('content:Hello|fillcolor:butter|62.107733,14.541936');
      }).toThrow('Invalid fillcolor configuration "fillcolor:butter"');
      expect(() => {
        parseText('content:Hello|fontsize:small|62.107733,14.541936');
      }).toThrow('Invalid fontsize configuration "fontsize:small"');
    });
    test('test parseText with valid arguments', () => {
      expect(parseText()).toBe(null);
      expect(parseText('')).toBe(null);
      expect(parseText(' ')).toBe(null);
      expect(parseText('content:Hello|62.107733,14.541936')).toStrictEqual({
        coord: [14.541936, 62.107733],
        text: 'Hello',
        color: process.env.TEXT_COLOR,
        width: process.env.TEXT_WIDTH,
        fill: process.env.TEXT_FILL_COLOR,
        size: process.env.TEXT_SIZE,
        font: process.env.TEXT_FONT,
        anchor: 'middle',
      });
      expect(
        parseText(
          'content:Hello|color:red|weight:10|font:Times New Roman|fontsize:18|fillcolor:yellow|anchor:start|62.107733,14.541936',
        ),
      ).toStrictEqual({
        coord: [14.541936, 62.107733],
        text: 'Hello',
        color: '#FF0000BB',
        width: 10,
        fill: '#FFFF00BB',
        size: 18,
        font: 'Times New Roman',
        anchor: 'start',
      });
    });
  });
});
