'use strict';

const sfccInstanceApi = require('sfcc-ci').instance;

/**
 * Upload data zip archive to Commerce Cloud instance.
 * 
 * @param {string} instance - Commerce Cloud instance.
 * @param {string} archive - file path to the local archive.
 * @param {string} token - Oauth token to use for authentication.
 * @param {Object} options - upload options (2FA credentials).
 * @returns {Promise} - The promise contains the result of deploying the data archive.
 */
function deploy(instance, archive, token, options) {
    const pfx = options.p12;
    const passphrase = options.passphrase;

    return new Promise(function(resolve, reject) {
        sfccInstanceApi.upload(instance, archive, token, { pfx, passphrase }, function (result) {
            if (typeof (result) !== 'undefined') {
                reject(result);
                return;
            }
            resolve(true);
        });
    });
}

/**
 * Upload data on Commerce Cloud instances.
 * 
 * @param {string[]} instances - An array of hostnames for Commerce Cloud instances.
 * @param {string[]} archives - The file paths to the local archive files.
 * @param {string} token - The Oauth token to use for authentication.
 * @param {Object} options - An object containing upload options (2FA credentials).
 * @returns {Promise[]} - Contains the results of deploying data.
 */
module.exports = function (instances, archives, token, options) {
    if (!instances || !instances.length) {
        throw new Error('An activation hostname is required');
    }

    return Promise.all(...instances.map(instance =>
                           archives.map(archive => deploy(instance, archive, token, options))
    ));
};
