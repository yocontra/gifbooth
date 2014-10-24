var nconf = require('nconf');

var defaults = {
  port: 9090,
  banned: [],
  backLog: 20,
  mongo: 'mongodb://localhost/booth-dev-local'
};

nconf.argv()
  .env()
  .defaults(defaults);

module.exports = nconf;