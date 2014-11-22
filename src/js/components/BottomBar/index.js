var CaptureMedia = require('../CaptureMedia');

var BottomBar = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  displayName: 'BottomBar',
  propTypes: {
    recordTime: React.PropTypes.number.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      text: 'Loading...',
      locked: true
    };
  },

  submit: function() {
    var txt = this.state.text;
    this.setState({
      text: 'Recording...',
      locked: true
    });
    this.refs.selfie.record(this.props.recordTime, function(blob){
      this.props.onSubmit(txt, blob);

      // unlock and reset input
      this.setState({
        locked: false,
        text: ''
      });
    }.bind(this));
  },

  handleKeyPress: function(e) {
    // on input keypress, check for Enter key
    if (e.which === 13) {
      this.submit();
    }
  },

  hasStream: function(stream) {
    this.setState({
      locked: false,
      text: ''
    });
  },

  render: function() {
    if (!window.chrome) {
      return null;
    }

    var selfie = CaptureMedia({
      ref: 'selfie',
      key: 'selfie',
      className: 'bottom-bar-selfie',
      onStream: this.hasStream
    });

    var txt = React.DOM.input({
      ref: 'txt',
      key: 'txt',
      placeholder: 'Type a message...',
      onKeyPress: this.handleKeyPress,
      disabled: this.state.locked,
      className: 'bottom-bar-text',
      valueLink: this.linkState('text')
    });

    var lockClass = this.state.locked ? 'locked' : 'unlocked';

    return React.DOM.div({
      ref: 'container',
      className: 'bottom-bar ' + lockClass
    }, [selfie, txt]);
  }
});

module.exports = BottomBar;