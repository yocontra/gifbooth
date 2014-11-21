var ChatMessage = React.createClass({
  displayName: 'ChatMessage',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    text: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      text: ''
    };
  },

  render: function() {
    var vid = React.DOM.img({
      ref: 'video',
      key: 'video',
      src: this.props.url,
      loop: true,
      controls: false,
      autoPlay: true,
      className: 'chat-message-video'
    });

    var msg = this.props.text ? React.DOM.div({
      ref: 'text',
      key: 'text',
      className: 'chat-message-text'
    }, this.props.text) : null;

    return React.DOM.div({
      ref: 'container',
      className: 'chat-message'
    }, [vid, msg]);
  }
});

module.exports = ChatMessage;