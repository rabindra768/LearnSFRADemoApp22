'use strict';

const optionatorConfig = require('./lib/optionatorConfig');
const optionator = require('optionator')(optionatorConfig);
const options = optionator.parse(process.argv);
const compile = require('./compileCode/compile');


compile(options);

