'use strict';

const path = require('path');

/**
 * Allows to configure aliases for you require loading
 */
module.exports.aliasConfig = {
    // enter all aliases to configure

    alias: {
        brand: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            './cartridges/app_ks_storefront/cartridge/client/default/'
        )
    }
};

/**
 * Allows copying files to static folder
 */
module.exports.copyConfig = {

    './cartridges/app_ks_storefront': [
        {
            from: 'cartridges/app_ks_storefront/cartridge/client/default/fonts',
            to: 'default/fonts'
        },
        {
            from: './node_modules/flag-icon-css/flags',
            to: 'default/fonts/flags'
        }
    ]
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = [
    './cartridges/app_ks_storefront'
];

/**
 * Lint options
 */
module.exports.lintConfig = {
    eslintFix: true,
    stylelintFix: true
};
