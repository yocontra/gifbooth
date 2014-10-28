var Application = require('./components/Application');

var socket = io.connect();
var app = Application({socket: socket});
React.renderComponent(app, document.body);