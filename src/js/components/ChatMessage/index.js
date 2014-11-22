var supported = ['webm', 'ogg', 'h264'];

var ChatMessage = React.createClass({
  displayName: 'ChatMessage',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    text: React.PropTypes.string
  },

  render: function() {
    var sources = supported.map(function(ext){
      return React.DOM.source({
        ref: 'video-'+ext+'-source',
        key: 'video-'+ext+'-source'+this.props.id,
        src: this.props.url + '.' + ext,
        type: 'video/' + ext
      });
    }, this);

    var vid = React.DOM.video({
      ref: 'video',
      key: 'video-'+this.props.id,
      loop: true,
      controls: false,
      autoPlay: true,
      className: 'chat-message-video'
    }, sources);

    var msg = this.props.text ? React.DOM.div({
      ref: 'text',
      key: 'text-'+this.props.id,
      className: 'chat-message-text'
    }, this.props.text) : null;

    return React.DOM.div({
      ref: 'container-'+this.props.id,
      className: 'chat-message'
    }, [vid, msg]);
  }
});

module.exports = ChatMessage;