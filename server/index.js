var config = require('../config');
var app = require('./connections/http');

app.listen(config.get('PORT'), function(){
  console.log('Listening on', config.get('port'));
});

module.exports = app;