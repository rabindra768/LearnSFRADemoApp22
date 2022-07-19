'use strict';

const path = require('path');
const fs = require('fs');
const del = require('del');
const promisfiedRequest = require('request-promise');
const util = require('./util');

/**
 * Deletes local temp directory used to store cartridge zip files.
 */
function deleteTempDirectory() {
  if (fs.existsSync(util.environment.TEMP_DIR)) {
      del.sync(util.environment.TEMP_DIR);
  }
};


function getOptions(instance, webdavPath, token, options, method, simple) {
  // the endpoint including the relative path on the instance's file system to upload to
  const endpoint = util.environment.WEBDAV_BASE + webdavPath;

  const opts = {
      baseUrl: 'https://' + instance,
      uri: endpoint,
      auth: {
          bearer: token
      },
      strictSSL: true,
      method,
      simple
  };

  // allow self-signed certificates, if needed (only supported for configuration via dw.json)
  if (options.selfSigned) {
      opts.strictSSL = false;

      console.warn('Allow self-signed certificates. Be cautious as this may expose secure information to an ' +
          'untrusted party.');
  }
  // allow client certificate and related passphrase if provided
  if (options && options.p12 && fs.existsSync(options.p12)) {
      const stat = fs.statSync(options.p12);
      if (stat.isFile()) {
          opts.agentOptions = {
              pfx: fs.readFileSync(options.p12),
              passphrase: options.passphrase // as passphrase is optional, it can be undefined here
          };
      }
  }

  return opts;
}


module.exports = function deleteData (instances, archives, token, options) {
  
  deleteTempDirectory();

  Promise.all(...instances.map(instance => archives.map(archive => {
      const filePath = path.join(util.environment.WEBDAV_INSTANCE_IMPEX, path.basename(archive));

      // build the request options
      const requestOpts = getOptions(instance, filePath, token, options, 'DELETE', false);

      return promisfiedRequest(requestOpts);
  })));
}
