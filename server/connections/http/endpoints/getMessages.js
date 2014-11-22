var mongo = require('../../mongo');

function getMessages(req, res, next){
  mongo.grid.files.find({
    // only count files that have webm
    contentType: 'video/webm'
  }).toArray(function(err, files) {
    if (err) {
      return res.status(500).json(err).end();
    }
    if (!files) {
      files = [];
    }
    files = files.map(function(file){
      return {
        video: file.filename,
        text: file.metadata.text
      };
    });
    res.status(200).json(files).end();
  });
};

module.exports = getMessages;