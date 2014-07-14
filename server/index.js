var http = require('http');
var express = require('express');
var sio = require('socket.io');
var uuid = require('uuid');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');

var app = express();
var server = http.Server(app);
var io = sio(server);

app.use(express.static(path.join(__dirname, '../dist')));
app.use(bodyParser());
app.use(methodOverride());

var vids = [];
var maxVideos = 20;

app.post('/upload', function(req, res, next){
  var payload = [];
  req.on('data', function(chunk){
    payload.push(chunk);
  });
  req.on('end', function() {
    var buf = Buffer.concat(payload);
    addVideo(buf);
    res.status(200);
    res.end();
  });
});

io.on('connection', function(socket){
  vids.forEach(function(vid){
    socket.emit('video', vid);
  });
});

function addVideo(buf) {
  var vid = {
    id: uuid.v4(),
    data: buf.toString('base64')
  };

  if (vids.length >= 20) {
    vids.pop();
  }
  vids.unshift(vid);
  io.emit('video', vid);
}
module.exports = server;