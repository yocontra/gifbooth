var config = require('../config');
var app = require('./connections/http');

app.listen(config.get('port'), function(){
  console.log('Listening on', config.get('port'));
});

module.exports = app;