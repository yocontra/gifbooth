var whammy = require('whammy');
var raf = require('raf');

module.exports = function(el, time, cb) {
  var w = el.getBoundingClientRect().width;
  var h = el.getBoundingClientRect().height;
  var encoder = new whammy.Video(60, 1);
  //delete encoder.duration; // hack

  var can = document.createElement('canvas');
  var ctx = can.getContext('2d');
  can.width = w;
  can.height = h;
  var start = Date.now();
  var last = start;

  var grab = function(){
    var now = Date.now();
    var since = now-start;
    var duration = now-last;
    if (duration === 0) {
      duration = 1;
    }

    if (since >= time) {
      return done();
    }
    ctx.drawImage(el, 0, 0, w, h);
    encoder.add(ctx);
    last = Date.now();
    raf(grab);
  };

  var done = function(){
    var output = encoder.compile();
    cb(null, output);
  };

  grab();
};