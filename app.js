var $ = require('jQuery')
var deviceList = require('./deviceList.js')
var devicePage = require('./devicePage.js')
var userList = require('./userList.js')

$('document').ready(function() {
  userList.ev.addListener('userSelected', deviceList.reload);
  deviceList.ev.addListener('deviceSelected', function(devId, info) {
    devicePage.show(devId, info);
  });


  userList.reload();
  deviceList.reload();
});
