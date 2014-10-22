var gum = require('getusermedia');
var CaptureMedia = require('./CaptureMedia');

var maxVideos = 10;
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

var Application = React.createClass({
  displayName: 'Application',
  propTypes: {
    socket: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      stream: null,
      videos: []
    };
  },

  componentWillMount: function() {
    gum({video: true, audio: false}, this.handleGUM);
    this.props.socket.on('video', this.addVideo);
    this.props.socket.on('clear', this.clear);
  },

  clear: function() {
    this.setState({videos: []});
  },

  addVideo: function(id) {
    var vids = this.state.videos;
    if (this.state.videos.length >= maxVideos) {
      vids.pop();
    }
    vids.unshift({
      id: id,
      url: '/video/'+id
    });
    this.setState({videos: vids});
  },

  handleGUM: function(err, stream){
    if (stream) {
      this.setState({
        stream: URL.createObjectURL(stream)
      });
      return;
    }
    console.error(err);
  },

  render: function() {
    var children = [];

    if (this.state.stream) {
      children.push(CaptureMedia({
        ref: 'selfie',
        key: 'getMedia',
        src: this.state.stream
      }));
    }

    this.state.videos.forEach(function(vid){
      children.push(React.DOM.video({
        key: vid.id,
        src: vid.url,
        loop: true,
        controls: false,
        autoPlay: true,
        className: 'remote-vid'
      }));
    });

    var container = React.DOM.div({
      className: 'wall'
    }, children);

    return container;
  }
});

module.exports = Application;