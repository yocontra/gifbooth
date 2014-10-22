var CaptureMedia = require('./CaptureMedia');

var BottomBar = React.createClass({
  displayName: 'BottomBar',
  propTypes: {
    recordTime: React.PropTypes.number.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      locked: false
    };
  },

  submit: function() {
    this.setState({locked: true});
    var txt = this.refs.txt.getDOMNode().value;
    this.refs.selfie.record(this.props.recordTime, function(blob){
      this.props.onSubmit(txt, blob);
      this.setState({locked: false});
    }.bind(this));
  },

  handleKeyPress: function(e) {
    if (e.which === 13) {
      this.submit();
    }
  },

  render: function() {
    var selfie = CaptureMedia({
      ref: 'selfie',
      key: 'selfie',
      className: 'bottom-bar-selfie'
    });

    var txt = React.DOM.input({
      ref: 'txt',
      key: 'txt',
      placeholder: 'Type a message...',
      onKeyPress: this.handleKeyPress,
      disabled: this.state.locked,
      className: 'bottom-bar-text'
    });

    return React.DOM.div({
      ref: 'container',
      className: 'bottom-bar'
    }, [selfie, txt]);
  }
});

module.exports = BottomBar;