var mongo = require('../../mongo');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');

function createMessage(req, res, next){
  var vid = req.files.video;
  var txt = req.body.text;

  // TODO: check vid mimetype
  if (!vid) {
    return res
      .status(400)
      .end();
  }

  // TODO: transcode
  // TODO: break out the file upload to gridfs into a fn
  var srcStream = fs.createReadStream(vid.path);
  var outStream = mongo.grid.createWriteStream({
    mode: 'w',
    content_type: 'video/H264',
    metadata: {
      text: txt
    }
  });
  outStream.once('close', success);
  outStream.once('error', fail);

  var cmd = ffmpeg(srcStream)
    .videoBitrate('1024k')
    .noAudio()
    .fps(23.976)
    .size('400x?')
    .toFormat('H264');
  
  cmd.pipe(outStream);

  function success(file) {
    req.wss.emit('message', {
      video: file._id,
      text: txt
    });
    res
      .status(200)
      .end();
  }

  function fail(err) {
    outStream.removeEventListener('close', success);
    res
      .status(500)
      .json(err)
      .end();
  }
};

module.exports = createMessage;