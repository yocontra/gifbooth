var React = require('react');
var gum = require('getusermedia');
var record = require('./record');

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

var CaptureMedia = React.createClass({
  displayName: 'CaptureMedia',
  propTypes: {
    onStream: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      stream: null,
      src: null
    };
  },

  componentWillMount: function() {
    gum({video: true, audio: false}, this.handleGUM);
  },

  componentDidMount: function() {
    var el = this.refs.videoElement.getDOMNode();
    el.addEventListener('playing', this.onPlay, false);
  },
  componentWillUnmount: function() {
    var el = this.refs.videoElement.getDOMNode();
    el.removeEventListener('playing', this.onPlay, false);
  },

  handleGUM: function(err, stream){
    if (!stream) {
      return console.error(err);
    }

    this.setState({
      stream: stream,
      src: URL.createObjectURL(stream)
    });
  },

  record: function(time, cb) {
    record(this.refs.videoElement.getDOMNode(), time, cb);
  },

  onPlay: function() {
    if (this.props.onStream) {
      this.props.onStream(this.state.stream);
    }
  },

  render: function() {
    return React.DOM.video({
      ref: 'videoElement',
      src: this.state.src,
      muted: true,
      autoPlay: true,
      className: this.props.className,
      style: this.props.style
    });
  }
});

module.exports = CaptureMedia;