module.exports = {
  "port": process.env.NODE_ENV === 'production' ? 80 : 9090,
  "banned": [],
  "backLog": 8,
  "duration": 2000,
  "bitrate": 1024,
  "sizeLimit": 1000000,
  "fps": 23,
  "types": [
    "gif"
    //"webm"
    //"h264"
  ],
  "mongo": "mongodb://localhost/booth-dev-local-2"
};
