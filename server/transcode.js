var ffmpeg = require('fluent-ffmpeg');
var mime = require('mime');
var mongo = require('./connections/mongo');
var config = require('../config');


var cfg = {
  size: '480x?',
  bitrate: config.bitrate,
  fps: config.fps,
  duration: config.duration/1000,
  aspect: '4:3'
};

function transcode(id, input, ext, meta, cb) {
  var contentType = mime.lookup(ext);
  var outStream = mongo.grid.createWriteStream({
    filename: id,
    mode: 'w',
    content_type: contentType,
    metadata: meta
  });
  outStream.once('close', success);
  outStream.once('error', fail);

  var cmd = ffmpeg(input)
    .videoBitrate(cfg.bitrate)
    .noAudio()
    .fps(cfg.fps)
    .size(cfg.size)
    .duration(cfg.duration)
    .aspectRatio(cfg.aspect)
    .autopad('white')
    .toFormat(ext);

  cmd.pipe(outStream);
  cmd.on('error', function(err, stdout, stderr){
    console.log(ext, err, stdout, stderr);
  });

  // TODO: clean up event listeners
  function success(file) {
    cb(null, file);
  }

  function fail(err) {
    cb(err);
  }

  return outStream;
}

module.exports = transcode;