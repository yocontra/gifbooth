var config = require('../config');
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');

var conn = mongoose.createConnection(config.get('mongo'));
conn.grid = Grid(conn.db, mongoose.mongo);

module.exports = conn;