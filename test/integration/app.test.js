const supertest = require('supertest');
const appBuilder = require('../../app');

let app = null;
beforeEach(async () => {
  app = appBuilder();
  await app.ready();
});

afterEach(() => {
  app.close();
});

describe('Going to test app', () => {
  test('Smoke test', async () => {
    const request = supertest(app.server);
    const res = await request.get('/');
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual({ data: 'Hello world' });
  });
  test('Required parameter is missing', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?size=100x200');
    expect(res.status).toBe(400);
    expect(res.body).toStrictEqual({ data: 'error', error: 'At least center, markers, path or text parameter is required' });
  });
  test('Minimal functional', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?size=100x200&center=12.02414,130.12344');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Minimal functional with png image format', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?size=100x200&center=12.02414,130.12344&format=png');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
  });
  test('Minimal functional with webp image format', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?size=100x200&center=12.02414,130.12344&format=webp');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/webp');
  });
  test('Minimal functional with webp image format', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?size=100x200&center=12.02414,130.12344&format=webp');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/webp');
  });
  test('Minimal functional with webp image format', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?size=100x200&center=12.02414,130.12344&format=webp');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/webp');
  });
  test('Map with single markers', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?markers=40.714728,-73.998672&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with multiple markers', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?markers=40.714728,-73.998672|63.259591,-144.667969&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with simple path', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=40.714728,-73.998672|40.714728,-73.598672&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with path and styles', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=weight:7|color:green|40.748689,-73.985133|40.749771,-73.987734|40.752928,-73.985472|40.754116,-73.988323|40.757951,-73.985572&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with path and styles and markers', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=weight:5|color:black|40.711148,-74.003352|40.700720,-73.990098&markers=color:black|40.711148,-74.003352|40.700720,-73.990098&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with polygon', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=40.757956,-73.985536|40.748462,-73.985645|40.751604,-73.975606|40.757956,-73.985536&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with polygon and styles', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=weight:3|color:red|fillcolor:ffffff88|40.757956,-73.985536|40.748462,-73.985645|40.751604,-73.975606|40.757956,-73.985536&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with polygon and styles but without end location', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=fillcolor:ffffff88|40.757956,-73.985536|40.748462,-73.985645|40.751604,-73.975606&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });
  test('Map with polygon and markers', async () => {
    const request = supertest(app.server);
    const res = await request.get('/?path=fillcolor:ffffff88|40.757956,-73.985536|40.748462,-73.985645|40.751604,-73.975606|40.757956,-73.985536&markers=color:black|40.757956,-73.985536|40.748462,-73.985645|40.751604,-73.975606&size=200x200');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/jpg');
  });

  // Skip running following tests on CI environments because fonts are not available
  if (process.env.ENV === 'dev') {
    test('Map with simple text', async () => {
      const request = supertest(app.server);
      const res = await request.get('/?text=content:Hello%20World|40.714728,-73.998672&size=200x200');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
    });
    test('Map with styled text', async () => {
      const request = supertest(app.server);
      const res = await request.get('/?text=content:Hello%20World|color:red|weight:2|font:Times%20New%20Roman|fontsize:30|fillcolor:yellow|40.714728,-73.998672&size=200x200');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
    });
    test('Map with styled text and marker', async () => {
      const request = supertest(app.server);
      const res = await request.get('/?text=content:Hello%20World|color:red|weight:2|font:Times%20New%20Roman|fontsize:15|anchor:start|40.714728,-73.998672&markers=color:red|40.714828,-73.998672&size=200x200');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
    });
  }
});
