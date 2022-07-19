'use strict'

const chalk = require('chalk');
const codeCompileWebpackConfig = require('./webpack.config');
const util = require('../lib/util');
const packageFile = util.getPackageJson();

module.exports = function (env, argv) {

  const options = (argv.mode === 'development') ? packageFile.prefCompile.development : packageFile.prefCompile.production;

  console.log(chalk.white(`Starting client-side compiler in ${chalk.green(argv.mode)} mode\n`));

  // Global object to share state across compiler instances (multi-site compilations)
  process.webpack = {
    activeScssCompilers: 0,
    activeJsCompilers: 0
  };
  // Get sites from package file
  let sites = packageFile.sites;

  // if siteTargets is defined in options
  if (options.siteTargets && options.siteTargets.length) {
    sites = sites.filter(site =>
      site.cartridges.some(cartridge =>
        options.siteTargets.some(target =>
          cartridge.alias === 'capriCore' && cartridge.name === target)));
  }

  // return an array of configuration objects per site to the webpack compiler
  return [].concat(...sites.map(site => new codeCompileWebpackConfig(site, options).create()));
};
