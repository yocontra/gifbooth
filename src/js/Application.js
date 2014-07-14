var gum = require('getusermedia');
var React = require('react');
var CaptureMedia = require('./CaptureMedia');

var QVGA = {
  minFrameRate: 30,
  minWidth: 320,
  minHeight: 240
};

var videoConstraints = {
  mandatory: QVGA,
  optional: [
    {facingMode: 'user'}
  ]
};

function base64toBlob(base64Data, contentType) {
  contentType = contentType || '';
  var sliceSize = 1024;
  var byteCharacters = atob(base64Data);
  var bytesLength = byteCharacters.length;
  var slicesCount = Math.ceil(bytesLength / sliceSize);
  var byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    var begin = sliceIndex * sliceSize;
    var end = Math.min(begin + sliceSize, bytesLength);

    var bytes = new Array(end - begin);
    for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

var Application = React.createClass({
  displayName: 'Application',
  propTypes: {
    socket: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      stream: null,
      declined: false,
      videos: []
    };
  },

  componentWillMount: function() {
    gum({video: true, audio: false}, this.handleGUM);

    this.props.socket.on('video', function(msg){
      //console.log(msg);
      var blegh = base64toBlob(msg, 'video/webm');
      var url = URL.createObjectURL(blegh);
      this.addVideo(url);
    }.bind(this));
  },

  addVideo: function(url) {
    var vids = this.state.videos;
    if (this.state.videos.length >= 20) {
      URL.revokeObjectURL(vids.pop());
    }
    vids.unshift(url);
    this.setState({videos: vids});
  },

  handleGUM: function(err, stream){
    if (stream) {
      this.setState({stream: stream});
      return;
    }
    console.error(err);
    this.setState({declined: true});
  },

  render: function() {
    if (!this.state.stream && !this.state.declined) {
      return React.DOM.div({className: 'wall'});
    }
    var children = [];

    if (this.state.stream) {
      children.push(CaptureMedia({stream: this.state.stream}));
    }

    this.state.videos.forEach(function(url){
      children.push(React.DOM.video({
        src: url,
        loop: true,
        controls: false,
        muted: true,
        autoPlay: true,
        className: 'remote-vid'
      }));
    });

    var container = React.DOM.div({className: 'wall'}, children);

    return container;
  }
});

module.exports = Application;