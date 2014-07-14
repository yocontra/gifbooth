var app = require('./server');

var port = process.env.PORT || 9090;
app.listen(port, function(){
  console.log('Listening on', port);
});