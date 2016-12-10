var $ = require('jQuery')
var deviceList = require('./deviceList.js')
var userList = require('./userList.js')

$('document').ready(function() {
  userList.ev.addListener('userSelected', deviceList.reload);
  deviceList.ev.addListener('deviceSelected', console.log);

  userList.reload();
  deviceList.reload();
});
