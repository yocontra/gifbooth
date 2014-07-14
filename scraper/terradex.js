var fs = require('fs');
var request = require('request');
var async = require('async');
var path = require('path');
var xml2json = require('xml2json');
var camelize = require('./lib/camelize');

var outPath = path.join(__dirname, '../data/terradex/');
var azBBox = '-114.8164,31.3320,-109.0450,37.0037';

var urls = {
  'plumes-geojson.json': 'http://geoload.terradex.com/geoserver/pgterradex/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=pgterradex:groundwater_plumes&count=500000&outputFormat=application/json&cql_filter=city=%27PHOENIX%27',
  'kml-joined-all-geojson.json': 'http://geoload.terradex.com/geoserver/pgterradex/ows?service=WFS&version=2.0.0&request=GetFeature&count=500000&outputFormat=application/json&typeName=pgterradex:ce_kml_data_joined_all&cql_filter=stateshort=%27AZ%27'
};

var getFeatures = function(cb) {
  var url = 'http://geoload.terradex.com/geoserver/wfs?version=2.0.0&request=GetCapabilities';
  request(url, function(err, res, body){
    if (err) {
      return cb(err);
    }
    if (res.statusCode !== 200) {
      return cb(new Error(body));
    }
    var json = xml2json.toJson(body, {object: true});
    var feats = json['wfs:WFS_Capabilities']
    .FeatureTypeList
    .FeatureType.map(function(feat){
      return {
        id: feat.Name,
        name: feat.Title,
        bounds: {
          upper: feat['ows:WGS84BoundingBox']['ows:UpperCorner'].split(' ').map(parseFloat),
          lower: feat['ows:WGS84BoundingBox']['ows:LowerCorner'].split(' ').map(parseFloat)
        }
      };
    });

    cb(null, feats);
  });
};

var rip = function(feat, cb) {
  console.log('Pulling', feat.id);
  var url = 'http://geoload.terradex.com/geoserver/pgterradex/wfs?version=2.0.0&request=GetFeature&count=500000&outputFormat=application/json&typeName='+feat.id;
  var fPath = path.join(outPath, camelize(feat.name)+'.json');
  var str = request(url).pipe(fs.createWriteStream(fPath));
  str.once('error', cb);
  str.once('finish', cb);
};

getFeatures(function(err, features){
  if (err) {
    return console.error(err);
  }
  console.log('Pulling down', features.length, 'layers');

  async.forEachLimit(features, 10, rip, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log('Done!');
  });
});