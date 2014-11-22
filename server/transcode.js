var ffmpeg = require('fluent-ffmpeg');
var mime = require('mime');
var mongo = require('./connections/mongo');

var cfg = {
  size: '400x?',
  bitrate: 1024,
  fps: 30,
  duration: 4,
  aspect: '4:3'
};

function transcode(id, inputStream, ext, meta, cb) {
  var contentType = mime.lookup(ext);
  var outStream = mongo.grid.createWriteStream({
    filename: id,
    mode: 'w',
    content_type: contentType,
    metadata: meta
  });
  outStream.once('close', success);
  outStream.once('error', fail);

  var cmd = ffmpeg(inputStream)
    .videoBitrate(cfg.bitrate)
    .noAudio()
    .fps(cfg.fps)
    .size(cfg.size)
    .duration(cfg.duration)
    .aspectRatio(cfg.aspect)
    .autopad('white')
    .toFormat(ext);

  if (ext === 'gif') {
    cmd = cmd.addOptions('-pix_fmt rgb24');
  }
  cmd.pipe(outStream);
  cmd.on('error', function(err, stdout, stderr){
    console.log(ext, err, stdout, stderr);
  });
  function success(file) {
    cb(null, file);
  }

  function fail(err) {
    cb(err);
  }

  return outStream;
}

module.exports = transcode;