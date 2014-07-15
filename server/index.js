var http = require('http');
var express = require('express');
var sio = require('socket.io');
var uuid = require('uuid');

var rate = require('express-rate');
var ipfilter = require('ipfilter');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var fs = require('fs');
var del = require('del');

var vidPath = path.join(__dirname, '../dist/video');
var app = express();
var server = http.Server(app);
var io = sio(server);

var banned = ['67.212.112.186'];
var maxVideos = 20;
var counter = 0;

var simpleMiddleware = rate.middleware({interval: 6, limit: 3});

app.use(ipfilter(banned));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser());
app.use(methodOverride());

del.sync(vidPath+'/*');

app.post('/upload', simpleMiddleware, function(req, res, next){
  var id = ++counter;

  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var outPath = path.join(vidPath, id+'.webm');
  console.log(outPath, 'from', ip);
  req.pipe(fs.createWriteStream(outPath)).once('finish', function(){
    io.emit('video', id);
    res.status(200);
    res.end();
  });
});

io.on('connection', function(socket){
  fs.readdir(vidPath, function(err, files){
    files.sort().slice(0, maxVideos).forEach(function(file){
      socket.emit('video', path.basename(file, path.extname(file)));
    });
  });
});

module.exports = server;