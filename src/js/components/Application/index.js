var React = require('react');
var request = require('superagent');
var BottomBar = React.createFactory(require('../BottomBar'));
var ChatMessage = React.createFactory(require('../ChatMessage'));

var Application = React.createClass({
  displayName: 'Application',
  propTypes: {
    socket: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      messages: []
    };
  },

  componentWillMount: function() {
    request.get('/messages')
      .type('json')
      .end(function(err, res){
        if (err) {
          return console.error(err);
        }
        res.body.forEach(this.addMessage);
        this.props.socket.on('message', this.addMessage);
      }.bind(this));
  },

  addMessage: function(msg) {
    var msgs = this.state.messages;
    msgs.unshift({
      key: msg.video,
      id: msg.video,
      text: msg.text,
      url: '/video/'+msg.video
    });
    this.setState({messages: msgs});
  },

  sendMessage: function(txt, vid) {
    var formData = new FormData();
    formData.append('text', txt);
    formData.append('video', vid);

    var req = new XMLHttpRequest();
    req.open('POST', '/upload', true);
    req.send(formData);
  },

  render: function() {
    var bar = BottomBar({
      ref: 'bottomBar',
      key: 'bottomBar',
      recordTime: 4000,
      onSubmit: this.sendMessage
    });


    var msgs = React.DOM.div({
      className: 'message-wall',
      key: 'messageWall',
      ref: 'messageWall'
    }, this.state.messages.map(ChatMessage));

    var container = React.DOM.div({
      className: 'application'
    }, [msgs, bar]);

    return container;
  }
});

module.exports = Application;