var Application = require('./components/Application');

if (!window.chrome) {
  alert('Sorry! Only Google Chrome supports the features required to run this experiment.');
  return;
}

var socket = io.connect();
var app = Application({socket: socket});
React.renderComponent(app, document.body);