

'use strict';

var path = require('path');
var sfccInstanceApi = require('sfcc-ci').instance;
var sfccJobApi = require('sfcc-ci').job;

/**
* @param {String} instance Instance to start the job on
* @param {String} job_id The job to start
* @param {String} token The Oauth token to use for authentication
* @param {Array} job_params Array containing job parameters. A job parameter must be denoted by an object holding a key and a value property.
*/
async function startJob(instance, job_id, token, job_params) {

  return new Promise((resolve, reject) => {
    sfccJobApi.run(instance, job_id, job_params, token, function(error, result) {
          if (typeof (result) !== 'undefined') {
              resolve(result.body);
              return;
          }
          reject(error);
      });
  });
}


/**
* Confirms the completion of a job running on a Commerce Cloud instance.
* @param {string} instance - The hostname for a Commerce Cloud instance.
* @param {string} archive - The file path to the local archive file.
* @param {string} token - The Oauth token to use for authentication.
* @param {Object} job - A job object returned by a successful call to sfccInstanceApi.import()
* @returns {Promise} - Contains the result of the job once it completes.
*/
async function confirmJobCompletion(instance, job, token) {
  const { job_id, id } = job;
  
  return new Promise((resolve, reject) => {
      setInterval(function () {
          sfccJobApi.status(instance, job_id, id, token, (result, error) => {
              if (typeof (error) !== 'undefined') {
                  reject(error);
                  clearInterval(this);
                  return;
              } else if (result.status === 'ERROR') {
                  let errorMessage = '';
                  errorMessage += `The error occured when running the job "${job}"\n`;

                  result.step_executions.forEach(step => {
                      if (step.exit_status.message) {
                          errorMessage += `${step.exit_status.message}\n`;
                      }
                  });

                  errorMessage += `See the log file "Impex/log/${result.log_file_name}" for more information`;

                  reject({
                      isCustomError: true,
                      message: errorMessage
                  });
                  clearInterval(this);
                  return;
              } else if (result.status === 'OK') {
                  resolve(result);
                  clearInterval(this);
                  return;
              }
          });
      }, 2000);
  });
}

/**
* 
* @param {*} instances 
* @param {*} archives 
* @param {*} token 
*/
module.exports = function runJobs(instances, jobs, token) {
  if (!instances || !instances.length) {
      throw new Error('An activation hostname is required');
  }

  if (!jobs) {
    throw new Error('The jobs list is undefined');
  }

  return Promise.all(instances.map(async instance => {
      const results = [];

      for (const job of jobs) {
          const jobObj = await startJob(instance, job, token, {});
          const result = await confirmJobCompletion(instance, jobObj, token);
          results.push({
              instance,
              job,
              logFileName: result.log_file_name
          });
      }

      return results;
  }));
}

