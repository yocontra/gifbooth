var BottomBar = require('./BottomBar');

var Application = React.createClass({
  displayName: 'Application',
  propTypes: {
    socket: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      videos: []
    };
  },

  componentWillMount: function() {
    this.props.socket.on('video', this.addVideo);
  },

  addVideo: function(id) {
    var vids = this.state.videos;
    vids.unshift({
      id: id,
      url: '/video/'+id
    });
    this.setState({videos: vids});
  },

  sendMessage: function(txt, vid) {
    // TODO: send txt too
    // TODO: use superagent here
    var req = new XMLHttpRequest();
    req.open('POST', '/upload', true);
    req.send(vid);
  },

  render: function() {
    var bar = BottomBar({
      ref: 'bottomBar',
      key: 'bottomBar',
      recordTime: 3000,
      onSubmit: this.sendMessage
    });

    // TODO: make this a component w/ txt
    var videos = this.state.videos.map(function(vid){
      return React.DOM.video({
        key: vid.id,
        src: vid.url,
        loop: true,
        controls: false,
        autoPlay: true,
        className: 'remote-vid'
      });
    });

    var container = React.DOM.div({
      className: 'wall'
    }, [bar].concat(videos));

    return container;
  }
});

module.exports = Application;