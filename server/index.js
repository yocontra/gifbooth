var config = require('../config');

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

var counter = 0;

var videoList = [];
updateVideoList(function(err){
  if (err) console.error('Error updating video list', err);
  if (videoList.length >= 1) {
    counter = parseInt(videoList[videoList.length-1], 10);
  }
  console.log('Counter is', counter);
});

var rateLimit = rate.middleware({interval: 6, limit: 3});

app.use(ipfilter(nconf.get('banned'), {log: false}));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(methodOverride());

app.post('/upload', rateLimit, uploadVideo);
io.on('connection', sendVideoList);

function sendVideoList(socket){
  videoList.forEach(socket.emit.bind(socket, 'video'));
}

function uploadVideo(req, res, next){
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var id = ++counter;
  console.log('Clip', id, 'uploading from', ip);

  var outPath = path.join(vidPath, id+'.webm');

  var writeStream = req.pipe(fs.createWriteStream(outPath));
  writeStream.once('error', function(err){
    console.error('Error writing file', err);
    del(outPath, function(){
      next(err);
    });
  });

  writeStream.once('finish', function(){
    console.log('Clip', id, 'uploaded from', ip);

    io.emit('video', id);
    updateVideoList(function(err){
      if (err) {
        return next(err);
      }
      res.status(200);
      res.end();
    });
  });
}

function updateVideoList(cb){
  fs.readdir(vidPath, function(err, files){
    if (err) {
      return cb(err);
    }
    videoList = files
      .map(function(file){
        return path.basename(file, path.extname(file));
      })
      .sort(function(a, b) {
          return parseInt(b, 10)-parseInt(a, 10);
      })
      .slice(0, nconf.get('backLog'))
      .reverse();
    
    if (files.length > nconf.get('backLog')) {
      return clearExcept(videoList, cb);
    }
    cb();
  });
}

function clearExcept(files, cb){
  var globs = [vidPath+'/*'];
  globs = globs.concat(files.map(function(path){
    return '!'+vidPath+'/'+path+'.webm';
  }));
  del(globs, cb);
}

module.exports = server;