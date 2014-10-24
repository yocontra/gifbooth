var config = require('../config');
var app = require('./connections/http');
var wss = require('./connections/wss');

app.http.listen(config.get('port'), function(){
  console.log('Listening on', config.get('port'));
});

module.exports = {
  app: app,
  wss: wss
};