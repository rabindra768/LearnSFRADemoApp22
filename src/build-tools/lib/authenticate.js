'use strict';

const chalk = require('chalk');
var sfccAuthApi = require('sfcc-ci').auth;

/**
 * Commerce Cloud Authenticates client and obtain Oauth2 token.
 * 
 * @param {string} clientId - OCAPI client ID / API key.
 * @param {string} clientSecret - OCAPI client secret / password.
 * @returns {Promise} - returns token or error message
 */
module.exports = function (clientId, clientSecret) {
  return new Promise((resolve, reject) => {
      sfccAuthApi.auth(clientId, clientSecret, (token, error) => {
        if (token) {
          resolve(token);
          return;
        }
        if (error) {
          chalk.red('Authentication error: %s', error);
        }
        reject(error);
      });
  });
}
