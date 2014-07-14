var request = require('request');
var geojson = require('geojson');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var tableToJSON = require('./lib/tableToJSON');

var outPath = path.join(__dirname, '../data/');
var jsonOut = path.join(outPath, 'businesses.json');
var geojsonOut = path.join(outPath, 'businesses-geojson.json');

getResults(function(err, docs){
  if (err) {
    return console.error(err);
  }
  fs.writeFileSync(jsonOut, JSON.stringify(docs, null, 2));

  geojson.parse(docs, {Point: ['lat', 'lon']}, function(out){
    fs.writeFileSync(geojsonOut, JSON.stringify(out, null, 2));

    console.log('Done!', docs.length, 'polluting businesses');
  });
});

function getResults(cb) {
  var url = 'http://www.azdeq.gov/cgi-bin/databases/eb.pl';
  var rOpt = {
    url: url,
    method: 'post',
    form: {
      pagenum: 1,
      cgifunction: 'Search'
    }
  };

  request(rOpt, function(err, res, body){
    if (err) {
      return cb(err);
    }
    if (res.statusCode !== 200) {
      return cb(new Error(body));
    }

    cb(null, resultsToJSON(body));
  });
}

function resultsToJSON(body) {
  var $ = cheerio.load(body);
  var items = $('table').toArray();

  var data = _(items)
    .map(tableToJSON)
    .filter(isHeader)
    .filter(hasLocation)
    .groupBy('placeLatLong')
    .map(cleanupDocument)
    .valueOf();

  return data;
}

function isHeader(doc) {
  return doc.creditType !== 'Credit Amount';
}

function hasLocation(doc) {
  return !!doc.placeLatLong && doc.placeLatLong !== 'Unknown';
}

function cleanupDocument(docs){
  var out = {};

  // coordinates
  var coords = docs[0].placeLatLong.split(' / ');
  out.lat = parseFloat(coords[0]);
  out.lon = parseFloat(coords[1]);

  // contact
  var contact = docs[0].contactNameAndPhone.split('; ');
  if (contact[0] !== 'Unknown') {
    out.contact = {
      name: contact[0],
      phone: contact[1]
    };
  }
  out.company = docs[0].companyName;
  out.name = docs[0].placeName;
  out.address = docs[0].placeAddress;

  // meta
  out.pollutants = docs.map(function(doc){
    return {
      pollutant: doc.pollutant,
      since: new Date(doc.reductionDate)
    };
  });

  return out;
}