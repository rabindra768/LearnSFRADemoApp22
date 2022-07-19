'use strict';

const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const util = require('./util');
const del = require('del');

/**
 * Create a zip file for the specified data bundle.
 * see https://github.com/archiverjs/node-archiver for more context.
 * 
 * @param {string} bundle - The name of the data bundle.
 * @returns {(Promise)} - A Promise object representing the results of archiving.
 */
function createArchive(bundle) {
  return new Promise(resolve => {
      const dataImpexDir = path.join(process.cwd(), 'data');
      const tempFilePath = path.join(util.environment.TEMP_DIR, `${bundle}.zip`);
      const outputStream = fs.createWriteStream(tempFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      // Log or throw an exception on any warnings when creating the Zip archive.
      archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
              console.log(chalk.yellow(err.message));
          } else {
              throw err;
          }
      });

      // Throw an exception on any explicit errors when creating the Zip archive.
      archive.on('error', (err) => {
          throw err;
      });

      // On the event that the archive is successfully created.
      outputStream.on('close', () => {
          resolve(tempFilePath);
          return;
      });

      archive.pipe(outputStream);

      archive.directory(path.join(dataImpexDir, bundle), bundle);

      archive.finalize();
  });
}

/**
 * Creates local temp directory used to store cartridge zip files.
 */
function createTempDirectory() {
  if (fs.existsSync(util.environment.TEMP_DIR)) {
      del.sync(util.environment.TEMP_DIR);
      fs.mkdirSync(util.environment.TEMP_DIR);
  } else {
      fs.mkdirSync(util.environment.TEMP_DIR);
  }
}

/**
 * 
 * @param {*} dataBundles 
 */
module.exports = function zipData (dataBundles) {
  if (!dataBundles) {
      return Promise.reject({
          isCustomError: true,
          message: 'The data bundle is undefined'
      });
  }

  createTempDirectory();

  return Promise.all(dataBundles.map(bundle => createArchive(bundle)));
}
