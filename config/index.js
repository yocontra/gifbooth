var nconf = require('nconf');

var defaults = {
  port: 9090,
  banned: [],
  backLog: 20
};

nconf.argv()
  .env()
  .defaults(defaults);

module.exports = nconf;