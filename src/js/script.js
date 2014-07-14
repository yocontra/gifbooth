var React = require('react');
var Application = require('./Application');
var socket = io.connect();

var mount = document.getElementById('application');
var app = Application({socket: socket});
React.renderComponent(app, mount);