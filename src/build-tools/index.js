'use strict';

const chalk = require('chalk');
const optionatorConfig = require('./lib/optionatorConfig');
const optionator = require('optionator')(optionatorConfig);
const util = require('./lib/util');
const packageFile = util.getPackageJson();
const deployData = require('./deployData/index');
const compile = require('./compileCode/index');
const runJobs = require('./runJobs/index');
const options = optionator.parse(process.argv);

/* Deploy Data */
if (options.deployData) {
  
  // Display console entry for starting builder
  console.log(chalk.bgBlue.black(`  Starting SFCC Deploy Script v${packageFile.version || 0} ` + `for SFRA v${packageFile.sfra_version || 0}  `));

  deployData(options);
}

if (options.runJobs) {
  // Display console entry for starting builder
  console.log(chalk.bgYellow.black(` Starting SFCC Jobs v${packageFile.version || 0} ` + `for SFRA v${packageFile.sfra_version || 0}  `));

  runJobs(options);
}

if (options.compile) {
  compile(options);
}
