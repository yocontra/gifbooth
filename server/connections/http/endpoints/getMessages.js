var mongo = require('../../mongo');

function getMessages(req, res, next){
  mongo.grid.files.find().toArray(function(err, files) {
    if (err) {
      return res
        .status(500)
        .json({error: err})
        .end();
    }
    res
      .status(200)
      .json(files || [])
      .end();
  });
};

module.exports = getMessages;