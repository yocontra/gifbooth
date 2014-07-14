var React = require('react');
var record = require('./record');

var BlobSource = {
  supported: !!URL,

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

var upload = function(blob, cb) {
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
    record(this.refs.videoElement.getDOMNode(), 3000, function(err, blob){
      upload(blob);
    });
  },

  render: function() {
    var props = {
      ref: 'videoElement',
      muted: true,
      autoPlay: true,
      className: 'video-preview',
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