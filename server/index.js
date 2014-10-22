var config = require('../config');
var mongo = require('./mongo');

var http = require('http');
var express = require('express');
var sio = require('socket.io');
var uuid = require('uuid');
var os = require('os');
var fs = require('fs');

var multer  = require('multer');
var rate = require('express-rate');
var ipfilter = require('ipfilter');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');

var app = express();
var server = http.Server(app);
var io = sio(server);

var rateLimit = rate.middleware({interval: 6, limit: 3});

app.use(methodOverride());
app.use(express.static(path.join(__dirname, '../dist')));

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

app.post('/upload', rateLimit, uploadVideo);
app.get('/videos', fetchVideoList);
app.get('/video/:id', fetchVideo);
io.on('connection', sendVideoList);

// DEPRECATED
function sendVideoList(socket){
  mongo.grid.files.find().toArray(function(err, files) {
    if (!files) {
      return;
    }
    files.forEach(function(file){
      var txt = file.metadata ? file.metadata.text : null;
      socket.emit('message', {
        video: file._id,
        text: txt
      });
    });
  });
}

// TODO: break these out into modules
function fetchVideoList(req, res, next){
  mongo.grid.files.find().toArray(function(err, files) {
    if (err) {
      return res.status(500).json({error: err}).end();
    }
    res.status(200).json(files || []).end();
  });
}

function uploadVideo(req, res, next){
  var vid = req.files.video;
  var txt = req.body.text;

  // TODO: check vid mimetype
  if (!vid) {
    return res.status(400).end();
  }
  // TODO: convert
  var outStream = mongo.grid.createWriteStream({
    mode: 'w',
    content_type: vid.mimetype,
    metadata: {
      text: txt
    }
  });
  outStream.once('close', success);
  outStream.once('error', fail);

  fs.createReadStream(vid.path).pipe(outStream);

  function success(file) {
    io.emit('message', {
      video: file._id,
      text: txt
    });
    res.status(200).end();
  }

  function fail(err) {
    outStream.removeEventListener('close', success);
    res.status(500).json(err).end();
  }
}

function fetchVideo(req, res, next){
  // TODO: extension or accepts
  var contentType = 'video/webm';

  var readStream = mongo.grid.createReadStream({
    _id: req.params.id,
    content_type: contentType
  });

  readStream.pipe(res);
}

module.exports = server;