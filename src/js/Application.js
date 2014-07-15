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
    this.props.socket.on('video', this.addVideo);
  },

  addVideo: function(id) {
    var vids = this.state.videos;
    if (this.state.videos.length >= 20) {
      vids.pop();
    }
    vids.unshift({
      id: id,
      url: '/video/'+id+'.webm'
    });
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
        autoPlay: true,
        className: 'remote-vid'
      }));
    });

    var container = React.DOM.div({className: 'wall'}, children);

    return container;
  }
});

module.exports = Application;