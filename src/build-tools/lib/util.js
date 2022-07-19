'use strict';

var path = require('path');
var fs = require('fs');
var chalk = require('chalk');


/**
 * Retrieves the package.json file.
 * @returns {JSON} - A package.json object. It will be empty if the package.json file can't be found.
 */
exports.getPackageJson = function() {
  var cwd = process.cwd();
  var folderName = cwd.split(path.sep).pop();
  
  if (folderName != 'src') {
      process.chdir('./src');
      cwd = process.cwd();
  }

  var packageFile = path.join(cwd, 'package.json');

  if (!fs.existsSync(packageFile)) {
      console.error('A package.json file was not found in the root directory!');
      return undefined;
  }

  return require(packageFile);
}


var packageFile = this.getPackageJson();
var LAST_DEPLOYMENT_FILE_NAME = packageFile.deployDataPrefs.options.lastDeploymentFileName;

/**
 * load dw.json file 
 */
exports.getDwJson = function() {
  let cwd = process.cwd();
  const folderName = cwd.split(path.sep).pop();

  if (folderName === 'src') {
      process.chdir('../');
      cwd = process.cwd();
  }

  const dwJsonFile = path.join(cwd, 'dw.json');

  if (!fs.existsSync(dwJsonFile)) {
      console.error('A dw.json file was not found in the root directory!');
      console.error('Only arguments passed via the CLI  will be used\n');
      return undefined;
  }

  return require(dwJsonFile);
};

/**
 * Filters a string to change it to camel case
 * @param {string} str - input string to process
 * @returns {string} - processed for camel case
 */
function camelCase(str) {
  return str.replace(/^.|-./g, (letter, index) => {
      if (!index) {
          return letter.toLowerCase();
      }

      return letter.substr(1).toUpperCase();
  });
}


exports.environment = {
  WEBDAV_BASE: '/on/demandware.servlet/webdav/Sites',
  WEBDAV_INSTANCE_IMPEX: '/impex/src/instance',
  WEBDAV_CODE: '/cartridges',
  TEMP_DIR: path.join(process.cwd(), 'build-tools', 'temp')
};

/**
 * Merges upload properties between CLI arguments and the dw.json file.
 * @param {Object} cliOptions - An options object created optionator containing CLI arguments and their values.
 * @returns {Object} - An object containing upload properties.
 */
exports.mergeUploadProperties = function(cliOptions) {
  const defaultOptions = {
      codeVersion: process.env.BUILD_TAG || 'build'
  };
  const dwOptions = {};
  const dwJson = this.getDwJson();

  if (dwJson) {
      Object.keys(dwJson).forEach(key => {
          dwOptions[camelCase(key)] = dwJson[key];
      });

      return Object.assign(defaultOptions, dwOptions, cliOptions);
  }

  return Object.assign(defaultOptions, cliOptions);
};

/**
 * Check if two-factor authentication is required
 * @param {string} hostname
 * @param {Array} certHostNames
 * @param {string} p12
 * @param {string} passphrase
 */
exports.check2FA = function(hostnames, certHostnames, p12, passphrase) {
  for (const hostname of hostnames) {
    if (hostname.indexOf('staging') >= 0 && (!certHostnames || !certHostnames.length || !p12 || !passphrase)) {
      throw Error('Missing 2FA credentials!');
    }
  }
};

/**
 * Keep record of last time of deployment
 */
exports.lastDeploymentTime = function() {
  if (fs.existsSync(path.join(process.cwd(), LAST_DEPLOYMENT_FILE_NAME))) {
      const lastDeploymentTimeString = fs.readFileSync(LAST_DEPLOYMENT_FILE_NAME, 'utf8');
      const lastDeploymentDate = new Date(parseInt(lastDeploymentTimeString, 10));
      console.log(`Last Deployment Timestamp: ${lastDeploymentDate.toString()}`);
  }
};

exports.saveTimeOfDeployment = () => {
  fs.writeFile(LAST_DEPLOYMENT_FILE_NAME, new Date().getTime(), (err) => {
      if (err) {
          throw err;
      }
  });
};

exports.getJobResultsInfo = (jobResults) => {
  const LOG_FILE_DIR = '/on/demandware.servlet/webdav/Sites/Impex/log/';
  return jobResults.map(jobResult => {
    const jobLog = jobResult.reduce((log, result, index) => {
        if (index === 0) {
          var logstr;
          if (result.archive) {
            log += `Instance ${chalk.bold(result.instance)} imported data bundles:\n`;
            logstr = path.parse(result.archive).name;
          } else if (result.job) {
            log += `Instance ${chalk.bold(result.instance)} following jobs completed:\n`;
            logstr = result.job;
          }
        }
        log += `  ${chalk.bold(logstr)} ` +
                   `- https://${result.instance + LOG_FILE_DIR}` +
                   `${result.logFileName}\n`;

        return log;
    }, '');

    return jobLog;
  });
};

exports.getTargetCartridge = function(obj, options) {
  var targetCartrige = options.staticCartridgeLocation || 'site'
  return obj[
    obj.findIndex(cartridge => cartridge.alias === targetCartrige)
  ];
}
