var whammy = require('whammy');
var raf = require('raf');

var vid = document.createElement('video');
var can = document.createElement('canvas');

var fps = 30;
module.exports = function(el, time, cb) {
  var encoder = new whammy.Video(fps, 1);
  //delete encoder.duration; // hack

  var aspectRatio = el.videoHeight / el.videoWidth;
  var w = Math.max(el.videoWidth, 400);
  var h = aspectRatio * w;
  can.width = w;
  can.height = h;
  vid.width = w;
  vid.height = h;
  vid.src = el.src;

  var ctx = can.getContext('2d');
  var start = Date.now();
  var last = start;

  var grab = function(){
    var since = Date.now()-start;

    if (since >= time) {
      return done();
    }

    setTimeout(grab, fps);
    ctx.drawImage(vid, 0, 0, w, h);
    encoder.add(ctx);
  };

  var done = function(){
    var output = encoder.compile();
    vid.src = '';
    vid.pause();
    vid.removeEventListener('playing', grab, false);
    cb(output);
  };

  vid.addEventListener('playing', grab, false);
  vid.play();
};