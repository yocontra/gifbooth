var fs = require('fs');
var path = require('path');

module.exports = {
  key: fs.readFileSync(path.join(__dirname, './key.pem')),
  cert: fs.readFileSync(path.join(__dirname, './cert.pem'))
}
