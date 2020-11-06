const path = require('path');
const del = require('del');
require('dotenv').config();

// clear cache
const cacheDir = path.resolve(process.env.CACHE_DIRECTORY);
// eslint-disable-next-line no-console
console.log(`Deleting cache directory contents ${cacheDir}`);
del.sync([`${cacheDir}/**`]);
