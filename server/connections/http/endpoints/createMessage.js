var mongo = require('../../mongo');
var io = require('../../wss');
var fs = require('fs');

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