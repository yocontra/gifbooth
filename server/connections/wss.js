var sio = require('socket.io');
var mongo = require('./mongo');
var app = require('./http');

var wss = sio(app.http);

// DEPRECATED
wss.on('connection', sendVideoList);
function sendVideoList(socket){
  mongo.grid.files.find().toArray(function(err, files) {
    if (!files) {
      return;
    }
    files.forEach(function(file){
      var txt = file.metadata ? file.metadata.text : null;
      socket.emit('message', {
        video: file._id,
        text: txt
      });
    });
  });
}

module.exports = wss;