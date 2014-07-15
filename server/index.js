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

var keys = [];//['de-la-party'];
var banned = ['67.212.112.186'];
var maxVideos = 2;
var counter = 0;

var videoList = [];
updateVideoList(function(err){
  if (err) console.error('Error updating video list', err);
});

var rateLimit = rate.middleware({interval: 6, limit: 3});

app.use(ipfilter(banned, {log: false}));
app.use(express.static(path.join(__dirname, '../dist')));
app.use(methodOverride());

app.post('/upload', rateLimit, checkAPIKey, uploadVideo);
app.get('/clean', rateLimit, checkAPIKey, empty);
io.on('connection', sendVideoList);

function empty(req, res, next){
  io.emit('clear');
  clearExcept([], function(err){
    if (err) {
      return next(err);
    }
    res.status(200);
    res.end();
  });
}

function sendVideoList(socket){
  videoList.forEach(socket.emit.bind(socket, 'video'));
}

function uploadVideo(req, res, next){
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var id = ++counter;
  console.log('Clip', id, 'from', ip);

  var outPath = path.join(vidPath, id+'.webm');

  var writeStream = req.pipe(fs.createWriteStream(outPath));
  writeStream.once('error', function(err){
    del(outPath, function(){
      next(err);
    });
  });
  writeStream.once('finish', function(){
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

function checkAPIKey(req, res, next){
  if (keys.length === 0) return next();
  if (keys.indexOf(req.query.key) === -1) {
    res.status(401);
    return res.end();
  }
  next();
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
          return b-a;
      })
      .slice(0, maxVideos)
      .reverse();
    
    if (files.length > maxVideos) {
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