'use strict';

const chalk = require('chalk');
const cliSpinners = require('cli-spinners');
const ora = require('ora');
const spinner = new ora({ spinner: cliSpinners.simpleDotsScrolling });

const util = require('../lib/util');
const authenticate = require('../lib/authenticate');
const runJobs = require('../lib/runJob');
const packageFile = util.getPackageJson();


module.exports = async function(cliArgs) {
  let {
    clientId, 
    clientSecret,
    hostname, 
    deployHostname, 
    jobBundle,
    jobName,
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
  } else {
      if (!Array.isArray(hostname)) {
          hostname = [].concat(hostname);
      }
  }

  if (certHostname && !Array.isArray(certHostname)) {
      certHostname = [].concat(certHostname);
  }

  var jobBundles;


  try {

    if (jobName) {
        jobBundles = [jobName];
    } else if (packageFile.jobsBundle[jobBundle]) {
        jobBundles = packageFile.jobsBundle[jobBundle];
    } else {
        throw Error('No Job Name (--jobName) or matching Jobs Bundle found in packge.json.');
    }

    // Check if 2FA is required
    util.check2FA(hostname, certHostname, p12, passphrase);

    // Authenticate
    spinner.start(chalk.yellow('Authenticating'));
    const token = await authenticate(clientId, clientSecret);
    spinner.succeed(chalk.green('Authentication Successful - Token:'+ token));
    
    // Run Jobs
    spinner.start(chalk.yellow('Running Jobs: '+ jobBundles));
    const results = await runJobs(hostname, jobBundles, token);
    spinner.succeed(chalk.green('Jobs Completed'));
    
    // Log results
    const jobLogs = util.getJobResultsInfo(results);
    jobLogs.forEach(jobLog => console.log(jobLog));
    

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
