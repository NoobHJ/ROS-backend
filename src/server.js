const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto'); // Node.js의 crypto 모듈 사용
const app = express();
const server = http.createServer(app);

const ROSLIB = require('roslib');
const recoderUTM = require('./recoder/recoder_utm');
const recoderGPS = require('./recoder/recoder_gps');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

const ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090'
});

// Initialize connection to ROS
ros.on('connection', () => {
  console.log('Connected to ROSBridge WebSocket');
  recoderUTM.initializeUTMTopic(ros);
  recoderGPS.initializeGPSTopic(ros);
});

ros.on('error', (error) => {
  console.error('Error connecting to ROSBridge WebSocket:', error);
});

ros.on('close', () => {
  console.log('Connection to ROSBridge WebSocket closed');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Generate nonce value using crypto module
const nonce_key = crypto.randomBytes(16).toString('base64');

// Route to serve localization.html
app.get('/localization.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'localization.html'));
});

app.get('/utm_XYH', (req, res) => {
  const utm_XYHData = recoderUTM.getUTMData();
  res.json(utm_XYHData);
});

app.get('/ublox_c099_f9p/navpvt', (req, res) => {
  const gpsData = recoderGPS.getGPSData();
  res.json(gpsData);
});
