var config = require('../../../config');
var mongo = require('../mongo');

var http = require('http');
var express = require('express');
var os = require('os');
var multer = require('multer');
var rate = require('express-rate');
var ipfilter = require('ipfilter');
var methodOverride = require('method-override');
var path = require('path');

var getVideo = require('./endpoints/getVideo');
var createMessage = require('./endpoints/createMessage');
var getMessages = require('./endpoints/getMessages');

var app = express();
var server = http.Server(app);

var rateLimit = rate.middleware({
  interval: 6,
  limit: 3
});

app.use(methodOverride());
app.use(express.static(path.join(__dirname, '../../../dist')));

app.use(ipfilter(config.get('banned'), {log: false}));
app.use(multer({
  dest: os.tmpdir(),
  limits: {
    files: 1,
    fields: 1,
    fieldNameSize: 10,
    parts: 2
  }
}));

app.post('/upload', rateLimit, createMessage);
app.get('/messages', getMessages);
app.get('/video/:id', getVideo);

app.http = server;
module.exports = app;