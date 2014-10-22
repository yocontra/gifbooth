var React = require('react');
window.React = React; // for devtools

var Application = require('./Application');

if (!window.chrome) {
  alert('Sorry! Only Google Chrome supports the features required to run this experiment.');
  return;
}

var socket = io.connect();
var mount = document.getElementById('application');
var app = Application({socket: socket});
React.renderComponent(app, mount);