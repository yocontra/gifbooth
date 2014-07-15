var React = require('react');
var record = require('./record');

var BlobSource = {
  supported: !!URL,

  getInitialState: function() {
    return {
      recording: false
    };
  },

  getBlob: function (stream) {
    if (!this.blob) {
      this.blob = URL.createObjectURL(stream);
    }
    return this.blob;
  },

  componentWillUnmount: function () {
    if (this.blob) {
      URL.revokeObjectURL(this.blob);
      delete this.blob;
    }
  }
};

var upload = function(blob) {
  var req = new XMLHttpRequest();
  req.open('POST', '/upload', true);
  req.send(blob);
};

var CaptureMedia = React.createClass({
  displayName: 'CaptureMedia',
  mixins: [BlobSource],
  propTypes: {
    stream: React.PropTypes.object.isRequired
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
      muted: true,
      autoPlay: true,
      className: className,
      style: this.props.style,
      onClick: this.record
    };

    // new browsers
    if (BlobSource.supported && this.props.stream) {
      props.src = this.getBlob(this.props.stream);
    }
    // old browsers
    if (!BlobSource.supported && this.props.stream) {
      props.srcObject = this.props.stream;
      props.webkitSrcObject = this.props.stream;
      props.mozSrcObject = this.props.stream;
    }

    var videoElement = React.DOM.video(props);

    return videoElement;
  }
});

module.exports = CaptureMedia;