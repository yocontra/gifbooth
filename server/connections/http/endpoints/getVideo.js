var mongo = require('../../mongo');
var mime = require('mime');
var parseRange = require('range-parser');
var config = require('../../../../config');

function getVideo(req, res, next){
  if (config.get('types').indexOf(req.params.ext) === -1) {
    return res.status(404).end();
  }
  var rangeHead = req.get('range')
  var range = rangeHead ? parseRange(config.get('sizeLimit'), rangeHead) : null;
  var rangeObj;
  if (range && range.type !== 'bytes') {
    return res.status(400).end();
  }

  var contentType = mime.lookup(req.params.ext);
  
  mongo.grid.files.find({
    filename: req.params.id,
    contentType: contentType
  })
  .limit(1)
  .toArray(function (err, files) {
    if (err) {
      return res.status(500).json(err).end();
    }
    if (!files || files.length === 0) {
      return res.status(404).end();
    }
    if (files[0].length <= 0) {
      return res.status(404).end();
    }

    var total = files[0].length;
    if (range && range.length === 1) {
      rangeObj = {
        startPos: range[0].start,
        endPos: Math.min(range[0].end, total) - 1
      };
    }

    res.status(rangeObj ? 206 : 200);
    res.type(files[0].contentType);
    if (rangeObj) {
      var chunk = (rangeObj.endPos-rangeObj.startPos+1);
      var contentRange = 'bytes ' +
        rangeObj.startPos +
        '-' + rangeObj.endPos +
        '/' + total;

      res.set('Content-Length', chunk);
      res.set('Accept-Ranges', 'bytes');
      res.set('Content-Range', contentRange);
    } else {
      res.set('Content-Length', total);
    }

    var readStream = mongo.grid.createReadStream({
      _id: files[0]._id,
      range: rangeObj
    });
    readStream.once('error', function(err){
      res.status(500).json(err).end();
    });
    readStream.pipe(res);
  });
}

module.exports = getVideo;