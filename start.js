var config = require('./config');
var app = require('./server');

app.listen(config.get('port'), function(){
  console.log('Listening on', port);
});