const ROSLIB = require('roslib');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment-timezone');

let gpsData = {};

const csvWriter = createCsvWriter({
  path: path.join(__dirname, '../../db/gps_data.csv'),
  header: [
    { id: 'lat', title: 'LATITUDE' },
    { id: 'lon', title: 'LONGITUDE' },
    { id: 'numSV', title: 'NUM_SV' },
    { id: 'pDOP', title: 'PDOP' },
    { id: 'kst_time', title: 'KST_TIME' }
  ],
  append: true
});

function initializeGPSTopic(ros) {
  const gpsListener = new ROSLIB.Topic({
    ros: ros,
    name: 'ublox_c099_f9p/navpvt',
    messageType: 'ublox_msgs/NavPVT'
  });

  gpsListener.subscribe((message) => {
    gpsData = {
      lat: message.lat,
      lon: message.lon,
      numSV: message.numSV,
      pDOP: message.pDOP,
      kst_time: moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss')
    };
    console.log('Received GPS Data:', gpsData); // Debugging log
  });

  // Log the gpsData every 5 seconds and record to CSV
  setInterval(() => {
    console.log('gpsData:', gpsData); // Debugging log
    recordToCSV(gpsData);
  }, 5000);
}

function getGPSData() {
  return gpsData;
}

function recordToCSV(data) {
  if (!data || !data.lat) return; // Ensure data is valid

  csvWriter.writeRecords([data])
    .then(() => {
      console.log('GPS data written to CSV');
    })
    .catch(err => {
      console.error('Error writing to CSV:', err);
    });
}

module.exports = {
  initializeGPSTopic,
  getGPSData
};

// AIzaSyDtVob_68PwNx7KOxWjZvj5-Eokj0vidw8