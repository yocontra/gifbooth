var config = require('../config');
var app = require('./connections/http');

var prod = process.env.NODE_ENV === 'production';

var port = prod ? 443 : config.get('port');

app.listen(port, function(){
  console.log('Listening on', config.get('port'));
});

if (prod) {
  var http = require('http');
  http.createServer(function (req, res) {
    res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
    res.end();
  }).listen(80);
}

module.exports = app;
