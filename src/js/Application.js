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

var base64ToBlob = function(base64, contentType) {
  var binary = atob(base64);
  var len = binary.length;
  var buffer = new ArrayBuffer(len);
  var view = new Uint8Array(buffer);
  for (var i = 0; i < len; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return new Blob([view], {type: contentType});
};

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
      var blegh = base64ToBlob(msg.data, 'video/webm');
      var url = URL.createObjectURL(blegh);
      this.addVideo({
        id: msg.id,
        url: url
      });
    }.bind(this));
  },

  addVideo: function(vid) {
    var vids = this.state.videos;
    if (this.state.videos.length >= 20) {
      URL.revokeObjectURL(vids.pop().url);
    }
    vids.unshift(vid);
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
      children.push(CaptureMedia({
        key: 'getMedia',
        stream: this.state.stream
      }));
    }

    this.state.videos.forEach(function(vid){
      children.push(React.DOM.video({
        key: vid.id,
        src: vid.url,
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