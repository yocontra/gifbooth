var nconf = require('nconf');

var defaults = {
  port: 9090,
  banned: [],
  backLog: 20,
  sizeLimit: 1000000,
  types: ['gif', 'webm', 'ogg'],
  mongo: 'mongodb://localhost/booth-dev-local-2'
};

nconf.argv()
  .env()
  .defaults(defaults);

module.exports = nconf;