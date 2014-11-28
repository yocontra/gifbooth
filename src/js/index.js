var React = require('react');
var Application = React.createFactory(require('./components/Application'));

var socket = io.connect();
var app = Application({socket: socket});
React.render(app, document.body);