var fs = require('fs');
var async = require('async');
var transcode = require('../../../transcode');
var config = require('../../../../config');

function createMessage(req, res, next){
  var vid = req.files.video;
  var txt = req.body.text;

  if (!vid) {
    return res.status(400).end();
  }

  // TODO: validate we support vid mimetype

  var meta = {
    text: txt
  };

  async.forEach(config.get('types'), transcodeIt, function(err){
    if (err) {
      return res.status(500).json(err).end();
    }

    res.status(200).end();

    req.wss.emit('message', {
      video: vid.name,
      text: meta.text
    });
  });

  function transcodeIt(format, cb){
    var srcStream = fs.createReadStream(vid.path);
    transcode(vid.name, srcStream, format, meta, cb);
  }
};

module.exports = createMessage;