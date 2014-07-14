var $ = require('cheerio');
var _ = require('lodash');
var camelize = require('./camelize');

function tableToJSON(el) {
  var fields = $(el).children('tr').toArray();
  var fieldValues = _.map(fields, function(el){
    var parts = $(el).children('td').toArray();
    var partValues = _.map(parts, function(el){
      return $(el).text();
    });
    if (partValues[1]) {
      return [camelize(partValues[0]), partValues[1]];
    }
  });
  return _.zipObject(fieldValues);
}

module.exports = tableToJSON;