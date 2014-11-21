var nconf = require('nconf');

var defaults = {
  PORT: 9090,
  banned: [],
  backLog: 20,
  mongo: 'mongodb://localhost/booth-dev-local-2'
};

nconf.argv()
  .env()
  .defaults(defaults);

module.exports = nconf;