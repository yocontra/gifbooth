var React = require('react');
var record = require('./record');

var upload = function(blob) {
  var req = new XMLHttpRequest();
  req.open('POST', '/upload', true);
  req.send(blob);
};

var CaptureMedia = React.createClass({
  displayName: 'CaptureMedia',
  propTypes: {
    src: React.PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      recording: false
    };
  },

  componentWillMount: function() {
    document.addEventListener('keypress', function(e){
      if (e.keyCode === 13) {
        this.record();
      }
    }.bind(this));
  },

  record: function(cb) {
    if (this.state.recording) {
      return;
    }

    this.setState({recording: true});
    record(this.refs.videoElement.getDOMNode(), 3000, function(err, blob){
      if (blob) {
        upload(blob);
      }
      this.setState({recording: false});
    }.bind(this));
  },

  render: function() {
    var className = 'video-preview';
    if (this.state.recording) {
      className += ' recording';
    }
    var props = {
      ref: 'videoElement',
      src: this.props.src,
      muted: true,
      autoPlay: true,
      className: className,
      style: this.props.style,
      onClick: this.record
    };

    var videoElement = React.DOM.video(props);

    return videoElement;
  }
});

module.exports = CaptureMedia;