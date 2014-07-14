var React = require('react');
var Application = require('./Application');
var socket = io.connect('http://localhost');

var mount = document.getElementById('application');
var app = Application({socket: socket});
React.renderComponent(app, mount);