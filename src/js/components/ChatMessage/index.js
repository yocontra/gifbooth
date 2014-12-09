var React = require('react');
var events = require('add-event-listener');
var canPlayAny = require('../../lib/canPlayAny');

// video extensions we support grabbing
var supported = ['webm', 'h264'];

// detect if we should play gifs
var shouldUseGif = !canPlayAny(supported);

var ChatMessage = React.createClass({
  displayName: 'ChatMessage',
  propTypes: {
    id: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired,
    text: React.PropTypes.string
  },

  getDefaultProps: function(){
    return {
      text: '-'
    };
  },

  render: function() {
    var gif = React.DOM.img({
      ref: 'video-gif-source',
      key: 'video-gif-source-'+this.props.id,
      src: this.props.url + '.gif',
      className: 'chat-message-video'
    });

    var sources = supported.map(function(ext){
      return React.DOM.source({
        ref: 'video-'+ext+'-source',
        key: 'video-'+ext+'-source-'+this.props.id,
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

    console.log(this.props);

    var msg = React.DOM.div({
      ref: 'text',
      key: 'text-'+this.props.id,
      className: 'chat-message-text'
    }, this.props.text || '-');

    var media = shouldUseGif ? gif : vid;

    return React.DOM.div({
      ref: 'container-'+this.props.id,
      className: 'chat-message'
    }, [media, msg]);
  }
});

module.exports = ChatMessage;