'use strict';

const chalk = require('chalk');
const cliSpinners = require('cli-spinners');
const ora = require('ora');
const spinner = new ora({
  spinner: cliSpinners.simpleDotsScrolling
});

const util = require('../lib/util');
const authenticate = require('../lib/authenticate');
const zipData = require('../lib/zipFile');
const uploadData = require('../lib/uploadData');
const importData = require('../lib/importData');
const deleteData = require('../lib/deleteData');
const packageFile = util.getPackageJson();


module.exports = async function (cliArgs) {

  let {
    clientId,
    clientSecret,
    hostname,
    deployHostname,
    dataBundle,
    certHostname = null,
    p12 = null,
    passphrase = null,
    selfSigned = null
  } = util.mergeUploadProperties(cliArgs);

  // use deployHostname if set, else fall back to hostname
  if (deployHostname) {
    if (!Array.isArray(deployHostname)) {
      hostname = deployHostname.split(',');
    } else {
      hostname = deployHostname;
    }
  } else if (!Array.isArray(hostname)) {
    hostname = [].concat(hostname);
  }

  if (certHostname && !Array.isArray(certHostname)) {
    certHostname = [].concat(certHostname);
  }

  try {
    // Log the last time of a data deployment
    util.lastDeploymentTime();

    // Check if 2FA is required
    util.check2FA(hostname, certHostname, p12, passphrase);

    // Authenticate
    spinner.start(chalk.yellow('Authenticating'));
    const token = await authenticate(clientId, clientSecret);
    spinner.succeed(chalk.green('Authentication Successful - Token:' + token));

    // Create zip files
    spinner.start(chalk.yellow('Creating Zip for upload'));
    const dataBundles = packageFile.dataBundles[dataBundle];
    const data = await zipData(dataBundles);
    spinner.succeed(chalk.green('Data archive compressed'));

    // Upload files
    spinner.start(chalk.yellow('Uploading data zip file'));
    await uploadData(certHostname || hostname, data, token, {
      p12,
      passphrase
    });
    spinner.succeed(chalk.green('Data archive uploaded'));

    // Import data archive
    spinner.start(chalk.yellow('Importing data'));
    const results = await importData(hostname, data, token);
    spinner.succeed(chalk.green('Data archive imported'));

    // Clean up archives
    spinner.start(chalk.yellow('Deleting temporary data archives'));
    await deleteData(certHostname || hostname, data, token, {
      p12,
      passphrase,
      selfSigned
    });
    spinner.succeed(chalk.green('Deleted temporary data archives\n'));

    // Log results
    const jobLogs = util.getJobResultsInfo(results);
    jobLogs.forEach(jobLog => console.log(jobLog));

    // Save timestamp of current deployment
    util.saveTimeOfDeployment();

  } catch (error) {
    spinner.fail(chalk.red('An error occured!'));
    if (error && error.isCustomError) {
      console.log(chalk.red(error.message));
    } else {
      console.log(chalk.red(error));
      console.log(chalk.red('Please verify all credentials, upload arguments, and ocapi configurations'));
    }
    process.exit(1);
  }
}
