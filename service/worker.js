const request = require('request-promise');
const schedule = require('node-schedule');
const { Rating } = require('../database');



setInterval(() => {
  request('https://fetchlab.herokuapp.com/keepalive');
}, 1000 * 60 * 5);