var nconf = require('nconf');
var defaults = require('./defaults');

nconf.argv()
  .env()
  .defaults(defaults);

module.exports = nconf;