module.exports = function(supported) {
  try {
    var testVideo = document.createElement('video');
    return supported.some(function(type){
      return testVideo.canPlayType('video/'+type);
    });
  } catch (err) {
    return false;
  }
};