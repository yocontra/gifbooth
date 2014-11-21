var mongo = require('../../mongo');

function getVideo(req, res, next){
  // TODO: extension or accepts
  var contentType = 'video/gif';
  res.type('gif');

  var readStream = mongo.grid.createReadStream({
    _id: req.params.id,
    content_type: contentType
  });

  readStream.pipe(res);
}

module.exports = getVideo;