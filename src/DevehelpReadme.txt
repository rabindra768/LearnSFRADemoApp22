'use strict';

const path = require('path');
const glob = require('glob');
// @Todo - replace as this is not maintained anymore
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// - cleans static folder
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
// - copy config
const WebpackCopyPlugin = require('copy-webpack-plugin');
// - linter
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const StyleLintWebpackPlugin = require('stylelint-webpack-plugin');
// Live reload
var LiveReloadPlugin = require('webpack-livereload-plugin');
// - minification
const TerserPlugin = require('terser-webpack-plugin');
const helper = require('./build-tools/helper/helper');
let sfraBuilderConfig =
    process.env.npm_lifecycle_script.indexOf('testRunner') === -1 ?
        require(helper.getSfraBuilderConfig()) :
        require(helper.getSfraBuilderFixtureConfig());
const webpackHelper = require('./build-tools/webpackHandling/helper');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

process.noDeprecation = true;

/**
 * Multicartridge webpack configuration.
 */
class WebpackBundle {
    /**
     * Scans the cartridge client side source folder and returns an
     * object with sass and javascript files.
     *
     * @param {string} cartridge - The cartridge name
     * @param {string} fileType - determines compilation type
     * @return {Object} - Object of sass and js files
     */
    static scanEntryPoints(cartridge, fileType) {
        const srcPath = path.resolve(
            process.env.PWD,
            cartridge,
            'cartridge/client'
        );
        const srcSCSSPath = path.join(srcPath, '*', 'scss', '**', '*.scss');
        const srcJSPath = path.join(srcPath, '*', 'js', '**', '*.js');
        let files = {};

        // Scan scss files
        if (fileType === 'scss') {
            glob
                .sync(srcSCSSPath)
                .filter((source) => !path.basename(source).startsWith('_'))
                .map((source) => {
                    let sourceRelativePath = path.dirname(path.relative(srcPath, source));
                    sourceRelativePath = sourceRelativePath.split(path.sep);
                    sourceRelativePath[1] = sourceRelativePath[1].replace('scss', 'css');
                    sourceRelativePath = sourceRelativePath.join(path.sep);
                    const sourceName = path.basename(source);
                    const outputFile = path
                        .join(sourceRelativePath, sourceName)
                        .replace('.scss', '.scssjs'); // Webpack always create the output file
                    // TODO : Find how to not generate those files
                    files[outputFile] = source;
                    return source;
                });
        }

        // Scan js files
        if (fileType === 'js') {
            glob
                .sync(srcJSPath)
                .filter((source) => !path.basename(source).startsWith('_'))
                .map((source) => {
                    const sourceRelativePath = path.dirname(
                        path.relative(srcPath, source)
                    );
                    const sourceName = path.basename(source);
                    const outputFile = path.join(sourceRelativePath, sourceName);
                    files[outputFile] = source;
                    return source;
                });
        }
        return files;
    }

    /**
     * Plugins based on the filetype.
     * @param {string} cartridge - The cartridge path
     * @param {string} fileType - determines compilation type
     * @param {boolean} env - (isDevelopment) determines compile mode
     * @return {array} - Array of Plugins
     */
    static getPlugins(cartridge, fileType, env) {
        var plugins = [];
        if (
            fileType === 'copy' &&
            sfraBuilderConfig.copyConfig &&
            sfraBuilderConfig.copyConfig[cartridge]
        ) {
            plugins.push(
                new WebpackCopyPlugin({
                    patterns: sfraBuilderConfig.copyConfig[cartridge]
                })
            );
        }
        if (fileType === 'clean') {
            plugins.push(
                new CleanWebpackPlugin({
                    cleanOnceBeforeBuildPatterns: ['*/js', '*/css', '*/fonts'],
                    verbose: false
                })
            );
        }
        if ((fileType === 'js') && env.useLinter) {
            plugins.push(
                new ESLintWebpackPlugin({
                    files: `${cartridge}/cartridge/client`,
                    exclude: [
                        'node_modules',
                        sfraBuilderConfig.sfraFolderName ||
                        'storefront-reference-architecture'
                    ],
                    fix: sfraBuilderConfig.lintConfig &&
                        sfraBuilderConfig.lintConfig.eslintFix
                })
            );
        }
        if ((fileType === 'scss') && env.useLinter) {
            plugins.push(
                new StyleLintWebpackPlugin({
                    files: `${cartridge}/cartridge/client`,
                    exclude: [
                        'node_modules',
                        sfraBuilderConfig.sfraFolderName ||
                        'storefront-reference-architecture'
                    ],
                    fix: sfraBuilderConfig.lintConfig &&
                        sfraBuilderConfig.lintConfig.stylelintFix
                })
            );
        }
        if (fileType === 'scss') {
            plugins.push(
                new MiniCssExtractPlugin({
                    filename: (pathData) =>
                        pathData.chunk.name.replace(/\.scssjs$/, '.css')
                })
            );
        }
        if (
            env.livereload &&
            (fileType === 'js' || fileType === 'scss')
        ) {
            plugins.push(
                new LiveReloadPlugin({
                    ignore: ['**/client/', '*.map'], // We listen only on compiled files
                    liveCSS: false,
                    liveImg: false,
                    useSourceHash: true // useSourceSize is faster than useSourceHash but but it has a downside. If file size hasn't changed no reload is triggered. For example if color has changed from #000000 to #ffffff no reload will be triggered!)
                })
            );
        }

        return plugins;
    }

    /**
     * @typedef {{base: string}} alias
     */

    /**
     * Webpack uses aliases for module resolving, we build this dynamically so the same alias
     * can be used for a different file type
     * @param {Object} cartridgeAliases - Aliases which are avaible for module resolution
     * @param {string} fileType - JS/JSX or scss
     * @returns {Object} More dynamic aliases
     */
    static buildDynamicAliases(cartridgeAliases, fileType) {
        let aliases = {};
        let aliasKeys = Object.keys(cartridgeAliases);
        aliasKeys.forEach((key) => {
            aliases[key] = cartridgeAliases[key] + '/' + fileType;
        });
        return aliases;
    }

    /**
     * @typedef {{dev: boolean, useLinter: boolean}} env
     */

    /**
     * Returns the webpack config object tree.
     * @param {Object} env - Environment variable which can be passed through commandline
     * @param {string} cartridge - The cartridge name
     * @param {string} fileType - The file type
     * @return {Object} - Webpack config
     */
    static bundleCartridge(env = {}, cartridge, fileType) {
        let entryFiles = this.scanEntryPoints(cartridge, fileType);
        console.log('bundleCartridge ' + cartridge + ' fileType ' + fileType);
        if (
            fileType !== 'clean' &&
            fileType !== 'copy' &&
            Object.keys(entryFiles).length === 0
        ) {
            console.error(
                `Entry not found - please check if ${fileType} folder exist in your cartridge : ${cartridge}`
            );
            return null;
        }

        if (
            Object.keys(sfraBuilderConfig.aliasConfig).length === 0 ||
            Object.keys(sfraBuilderConfig.aliasConfig.alias).length === 0
        ) {
            console.error(
                'Alias config missing - needed for SFRA to compile - exiting'
            );
            return null;
        }

        const outputPath = path.resolve(
            process.env.PWD,
            cartridge,
            'cartridge',
            'static'
        );
        let ruleSet = webpackHelper.buildRuleSet(
            process.env.PWD,
            cartridge,
            env,
            fileType
        );
        let plugins = this.getPlugins(cartridge, fileType, env);
        if (fileType === 'js' && env.analyzerMode) {
            plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'disabled',
                    generateStatsFile: true,
                    statsOptions: { source: false },
                    statsFilename: '../../../../js_report/' + cartridge + '.' + fileType + '.json'
                })
            );
        }
        let modulePaths = ['node_modules'];
        const aliases = this.buildDynamicAliases(
            sfraBuilderConfig.aliasConfig.alias,
            fileType
        );
        // loop through all cartridges for node_modules lookup
        // this allows to require node_modules from every plugin, regardless if those
        // modules are installed in the given plugin
        sfraBuilderConfig.cartridges.forEach((includeCartridges) => {
            modulePaths.push(
                path.resolve(includeCartridges.split('cartridges')[0], 'node_modules')
            );
        });

        return {
            mode: env.dev === true ? 'development' : 'production',
            name: cartridge + '/' + (fileType === 'jsx' ? 'js' : fileType),
            stats: {
                children: false
            },
            entry: entryFiles,
            output: {
                path: outputPath,
                filename: '[name]'
            },
            resolve: {
                alias: aliases,
                modules: modulePaths
            },
            resolveLoader: {
                modules: [helper.getNodeModulesFolder(env, '')]
            },
            module: {
                rules: ruleSet
            },
            plugins: plugins,
            devtool: env.dev === true ? 'source-map' : undefined,
            cache: true,
            optimization: {
                minimize: !(env.dev === true),
                minimizer: [new TerserPlugin()]
            }
        };
    }
}

/**
 * testRunner allows to run the webpack config in testable context
 * @return {Object} - bundlesFiles
 */
function invoketestRunner() {
    let bundlesFiles = [];
    let sfraBuilderConfigFake = require('./webpackHandling/fixture_sfraBuilderConfig');
    let env = {};
    env.dev = false;
    env.testRunner = true;
    sfraBuilderConfigFake.cartridges.forEach((cartridge) => {
        bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'js'));
        bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'scss'));
    });
    return bundlesFiles;
}

// default export function
module.exports = (env) => {
    let bundlesFiles = [];
    if (env.testRunner) {
        return invoketestRunner();
    }
    sfraBuilderConfig.cartridges.forEach((cartridge) => {
        bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'clean'));
        bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'js'));
        bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'scss'));
        bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'copy'));
    });
    sfraBuilderConfig.cartridges.map(cartridge => { // eslint-disable-line
        env.onlyscss === true ? null : bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'js'));
        env.onlyjs === true ? null : bundlesFiles.push(WebpackBundle.bundleCartridge(env, cartridge, 'scss'));
    });
    return bundlesFiles.filter((bundleFiles) => !!bundleFiles);
};

// exposed for testability
module.exports.getPlugins = WebpackBundle.getPlugins;
module.exports.buildDynamicAliases = WebpackBundle.buildDynamicAliases;
module.exports.scanEntryPoints = WebpackBundle.scanEntryPoints;
module.exports.bundleCartridge = WebpackBundle.bundleCartridge;




-------sfraBuilderConfig help------
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
            './cartridges/app_mk_storefront/cartridge/client/default/'
        ),
        core: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../capri-core-sfcc/src/cartridges/app_capri_core/cartridge/client/default/'
        ),
        plugin_instorepickup_custom: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../capri-core-sfcc/src/integrations/plugin_instorepickup/cartridges/plugin_instorepickup_custom/cartridge/client/default/'
        ),
        int_bazaarvoice_sfra: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../capri-core-sfcc/src/integrations/link_bazaarvoice-release-20.1.0/cartridges/int_bazaarvoice_sfra/cartridge/client/default/'
        ),
        plugin_wishlists: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../capri-core-sfcc/src/integrations/plugin_wishlists/cartridges/plugin_wishlists_custom/cartridge/client/default/'
        ),
        int_google: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../capri-core-sfcc/src/cartridges/int_google/cartridge/client/default/'
        ),
        plugin_adobe_custom: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            './cartridges/plugin_adobe_custom/cartridge/client/default/'
        ),
        int_globale_sfra: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../integrations/link_globale_21.0.0/cartridges/int_globale_sfra/cartridge/client/default'
        ),
        int_cybersource_custom: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            '../../capri-core-sfcc/src/integrations/link_cybersource_21.3.0/cartridges/int_cybersource_custom/cartridge/client/default/'
        )
    }
};

/**
 * Allows copying files to static folder
 */
module.exports.copyConfig = {

    './cartridges/app_mk_storefront': [
        {
            from: 'cartridges/app_mk_storefront/cartridge/client/default/fonts',
            to: 'default/fonts'
        },
        {
            from: './node_modules/flag-icon-css/flags',
            to: 'default/fonts/flags'
        },
        {
            from: '../../capri-core-sfcc/src/integrations/link_cybersource_21.3.0/cartridges/int_cybersource_sfra/cartridge/client/default/custom',
            to: 'default/custom'
        }
    ]
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = [
    './cartridges/app_mk_storefront',
    '../../capri-core-sfcc/src/cartridges/plugin_instorepickup_custom',
    '../../capri-core-sfcc/src/integrations/plugin_wishlists/cartridges/plugin_wishlists_custom',
    '../../capri-core-sfcc/src/cartridges/int_google',
    './cartridges/plugin_adobe_custom',
    '../../capri-core-sfcc/src/cartridges/plugin_datalayer_custom',
    '../../capri-core-sfcc/src/integrations/link_globale_21.0.0/cartridges/int_globale_sfra',
    '../../capri-core-sfcc/src/integrations/link_cybersource_21.3.0/cartridges/int_cybersource_custom'
];

/**
 * Lint options
 */
module.exports.lintConfig = {
    eslintFix: true,
    stylelintFix: true
};





-------Package JSON ----
{
  "name": "app_mk_storefront",
  "version": "0.0.1",
  "description": "Michael Kors cartridge",
  "main": "index.js",
  "sfraBuilderConfig": "./sfraBuilderConfig",
  "scripts": {
    "test": "sgmf-scripts --test test/unit/**/*.js",
    "cover": "sgmf-scripts --cover 'test/unit'",
    "test:integration": "sgmf-scripts --integration 'test/integration/**/*.js'",
    "test:acceptance:custom": "npx codeceptjs run --plugins retryFailedStep --profile",
    "test:acceptance:deep": "npx codeceptjs run --plugins retryFailedStep --grep '(?=.*)^(?!.*@mobile)^(?!.*@tablet)^(?!.*@pageDesigner)' --profile",
    "test:acceptance:smoke": "npx codeceptjs run --plugins retryFailedStep --grep @happyPath --profile",
    "test:acceptance:pagedesigner": "npx codeceptjs run --plugins retryFailedStep --grep @pageDesigner --profile",
    "test:acceptance:desktop": "npx codeceptjs run --plugins retryFailedStep --grep '(?=.*)^(?!.*@mobile)^(?!.*@tablet)^(?!.*@pageDesigner)^(?!.*@deepTest)' --profile",
    "test:acceptance:mobile": "npx codeceptjs run --plugins retryFailedStep --profile sauce:phone --grep @mobile",
    "test:acceptance:tablet": "npx codeceptjs run --plugins retryFailedStep --profile sauce:tablet --grep @tablet",
    "test:acceptance:parallel": "npx codeceptjs run-multiple parallel --plugins retryFailedStep --profile",
    "test:acceptance:multibrowsers": "npx codeceptjs run-multiple multibrowsers --plugins retryFailedStep --profile",
    "test:acceptance:report": "./node_modules/.bin/allure serve test/acceptance/report",
    "bdd:snippets": "./node_modules/.bin/codeceptjs bdd:snippets --path",
    "compile": "webpack --config build-tools/compileCode/compile.js --mode=development",
    "compile:fonts": "node bin/Makefile compileFonts",
    "lint": "npm run lint:js && npm run lint:css",
    "lint:css": "npx stylelint 'cartridges/app_mk_storefront/**/*.scss'",
    "lint:js": "sgmf-scripts --lint js",
    "init:isml": "./node_modules/.bin/isml-linter --init",
    "lint:isml": "./node_modules/.bin/isml-linter",
    "build:isml": "./node_modules/.bin/isml-linter --build",
    "fix:isml": "./node_modules/.bin/isml-linter --autofix",
    "upload": "sgmf-scripts --upload",
    "uploadCartridge": "sgmf-scripts --uploadCartridge app_storefront_base && sgmf-scripts --uploadCartridge modules && sgmf-scripts --uploadCartridge bm_app_storefront_base",
    "watch": "./node_modules/.bin/webpack --config ./webpack.config.js --env dev --watch --env useLinter local --stats=minimal",
    "watch:static": "sgmf-scripts --watch static",
    "release": "node bin/Makefile release --",
    "npmInstall": "node ./build-tools/installHandling/install.js",
    "yarnInstall": "node ./build-tools/installHandling/install.js --useYarn",
    "prod": "./node_modules/.bin/webpack --config ./webpack.config.js --env local",
    "build": "./node_modules/.bin/webpack --config ./webpack.config.js --env dev --env local",
    "build:lint": "./node_modules/.bin/webpack --config ./webpack.config.js --env dev --env local --env useLinter --stats=minimal",
    "watch:lint": "./node_modules/.bin/webpack --config ./webpack.config.js --env dev --env useLinter --watch --env local --stats=minimal",
    "watch:reload": "./node_modules/.bin/webpack --config ./webpack.config.js --env dev --watch --env local --env livereload",
    "report:js": "./node_modules/.bin/webpack --config ./webpack.config.js --env local --env onlyjs --env analyzerMode && webpack-bundle-analyzer ./js_report/cartridges/app_mk_storefront.js.json -m static -r reports/app_mk_storefront.js.html"
  },
  "dependencies": {
    "app_capri_core": "file:../../capri-core-sfcc/src",
    "bootstrap": "^4.6.1",
    "cleave.js": "^1.5.3",
    "flag-icon-css": "^2.9.0",
    "font-awesome": "^4.7.0",
    "jquery": "^3.5.1",
    "lazysizes": "^0.6.0",
    "popper.js": "^1.16.1",
    "slick-carousel": "1.8.1",
    "sticky-sidebar-v2": "^1.1.1"
  },
  "devDependencies": {
    "@babel/core": "^7.16.0",
    "@babel/plugin-proposal-object-rest-spread": "^7.16.0",
    "@babel/preset-env": "^7.16.4",
    "@tridnguyen/config": "^2.3.1",
    "@wdio/sauce-service": "^5.14.0",
    "@wdio/selenium-standalone-service": "^5.13.2",
    "app-module-path": "^1.0.4",
    "autoprefixer": "10.4.0",
    "babel-core": "^6.26.3",
    "babel-loader": "^8.2.3",
    "babel-plugin-module-resolver": "4.1.0",
    "cache-loader": "^4.1.0",
    "chai": "^3.5.0",
    "chai-subset": "^1.6.0",
    "chalk": "^1.1.3",
    "cheerio": "0.22.0",
    "clean-webpack-plugin": "4.0.0",
    "copy-webpack-plugin": "9.0.1",
    "css-loader": "^6.5.1",
    "debug": "^4.1.1",
    "dw-api-mock": "https://github.com/SalesforceCommerceCloud/dw-api-mock.git",
    "eslint": "8.13.0",
    "eslint-config-airbnb-base": "^5.0.3",
    "eslint-config-prettier": "8.5.0",
    "eslint-loader": "^2.1.2",
    "eslint-plugin-import": "2.25.3",
    "eslint-plugin-prettier": "4.0.0",
    "eslint-plugin-sitegenesis": "~1.0.0",
    "eslint-webpack-plugin": "3.1.1",
    "husky": "^4.2.5",
    "isml-linter": "^5.26.4",
    "istanbul": "^0.4.5",
    "lodash": "^4.17.15",
    "mini-css-extract-plugin": "2.4.4",
    "mocha": "^5.2.0",
    "node-sass": "6.0.1",
    "postcss-loader": "6.2.0",
    "proxyquire": "1.7.4",
    "request-promise": "^4.2.4",
    "sass-loader": "12.3.0",
    "selenium-standalone": "^6.16.0",
    "sgmf-scripts": "^2.3.0",
    "style-loader": "^0.21.0",
    "stylelint": "14.0.1",
    "stylelint-config-standard": "^17.0.0",
    "stylelint-config-standard-scss": "^3.0.0",
    "stylelint-scss": "^4.2.0",
    "stylelint-webpack-plugin": "3.1.0",
    "webpack": "5.63.0",
    "webpack-bundle-analyzer": "^4.5.0",
    "webpack-cli": "4.9.1",
    "webpack-livereload-plugin": "3.0.2",
    "xml2js": "^0.4.22"
  },
  "browserslist": [
    "last 2 versions",
    "ie > 11"
  ],
  "deployDataPrefs": {
    "instanceRoot": "sandbox.us01.dx.commercecloud.salesforce.com",
    "options": {
      "archivePath": "../data",
      "lastDeploymentFileName": "lastbuild.properties",
      "uploadPath": "/on/demandware.servlet/webdav/Sites/Impex/src/instance/"
    }
  },
  "paths": {
    "base": "../../capri-core-sfcc/src/cartridges/app_storefront_base/",
    "capriCore": "../../capri-core-sfcc/src/cartridges/app_capri_core/",
    "wishlists": "../../capri-core-sfcc/src/integrations/plugin_wishlists/cartridges/plugin_wishlists",
    "cybersource": "../../capri-core-sfcc/src/integrations/link_cybersource_21.3.0/cartridges/int_cybersource_sfra/",
    "bazaarvoice": "../../capri-core-sfcc/src/integrations/link_bazaarvoice-release-20.1.0/cartridges/int_bazaarvoice_sfra/"
  },
  "prefCompile": {
    "development": {
      "mode": "development",
      "staticCartridgeLocation": "siteMK",
      "verbose": "false",
      "cssSourceMaps": "true",
      "cssAutoPrefixer": "true",
      "jsSourceMaps": "true",
      "notifications": "true"
    },
    "production": {
      "mode": "production",
      "staticCartridgeLocation": "siteMK",
      "verbose": "false",
      "cssSourceMaps": "false",
      "cssAutoPrefixer": "true",
      "jsSourceMaps": "false",
      "notifications": "false"
    }
  },
  "babel": {
    "presets": [
      [
        "@babel/preset-env"
      ]
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run build:lint"
    }
  },
  "sites": [
    {
      "cartridges": [
        {
          "alias": "siteMK",
          "name": "app_mk_storefront"
        },
        {
          "alias": "capriCore",
          "name": "app_capri_core",
          "path": "../../capri-core-sfcc/src/cartridges/"
        },
        {
          "alias": "wishlists",
          "name": "plugin_wishlists_custom",
          "path": "../../capri-core-sfcc/src/integrations/plugin_wishlists/cartridges/"
        },
        {
          "alias": "base",
          "name": "app_storefront_base",
          "path": "../../capri-core-sfcc/src/cartridges/app_storefront_base/cartridges/"
        },
        {
          "alias": "instorepickup",
          "name": "plugin_instorepickup_custom",
          "path": "../../capri-core-sfcc/src/cartridges/"
        },
        {
          "alias": "cybersource",
          "name": "int_cybersource_sfra",
          "path": "../../capri-core-sfcc/src/integrations/link_cybersource_21.3.0/cartridges/"
        },
        {
          "alias": "adobe",
          "name": "plugin_adobe_custom"
        },
        {
          "alias": "bazaarvoice",
          "name": "int_bazaarvoice_sfra",
          "path": "../../capri-core-sfcc/src/integrations/link_bazaarvoice-release-20.1.0/cartridges/"
        }
      ]
    }
  ]
}





Backup:-












var path = require('path');
    var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];
    var sgmfScripts = require('sgmf-scripts');

    module.exports = [{
        mode: 'production',
        name: 'js',
        entry: sgmfScripts.createJsPath(),
        output: {
            path: path.resolve('./cartridges/app_ks_storefront/cartridge/static'),
            filename: '[name].js'
        }
    }, {
        mode: 'none',
        name: 'scss',
        entry: sgmfScripts.createScssPath(),
        output: {
            path: path.resolve('./cartridges/app_ks_storefront/cartridge/static'),
            filename: '[name].css'
        },
        module: {
            rules: [{
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')()
                            ]
                        }
                    }, {
                        loader: 'sass-loader'
                    }]
                })
            }]
        },
        plugins: [
            new ExtractTextPlugin({ filename: '[name].css' })
        ]
    }];
