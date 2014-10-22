var config = require('../config');
var mongo = require('./mongo');

var http = require('http');
var express = require('express');
var sio = require('socket.io');
var uuid = require('uuid');

var rate = require('express-rate');
var ipfilter = require('ipfilter');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');

var app = express();
var server = http.Server(app);
var io = sio(server);

var rateLimit = rate.middleware({interval: 6, limit: 3});

app.use(ipfilter(config.get('banned'), {log: false}));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(methodOverride());

app.post('/upload', rateLimit, uploadVideo);
app.get('/videos', fetchVideoList);
app.get('/video/:id', fetchVideo);
io.on('connection', sendVideoList);

// DEPRECATED
function sendVideoList(socket){
  mongo.grid.files.find().toArray(function(err, files) {
    files.forEach(function(file){
      socket.emit('video', file._id);
    });
  });
}

function fetchVideoList(req, res, next){
  mongo.grid.files.find().toArray(function(err, files) {
    if (err) {
      return res.status(500).json({error: err}).end();
    }
    res.status(200).json(files).end();
  });
}

function uploadVideo(req, res, next){
  var outStream = mongo.grid.createWriteStream({
    mode: 'w',
    content_type: 'video/webm' // TODO: convert
  });
  outStream.once('close', success);
  outStream.once('error', fail);
  req.pipe(outStream);

  function success(file) {
    io.emit('video', file._id);
    res.status(200).end();
  }

  function fail(err) {
    outStream.removeEventListener('close', success);
    res.status(500).json(err).end();
  }
}

function fetchVideo(req, res, next){
  var contentType = 'video/webm'; // TODO: extension or accepts

  var readStream = mongo.grid.createReadStream({
    _id: req.params.id,
    content_type: contentType
  });

  readStream.pipe(res);
}

module.exports = server;