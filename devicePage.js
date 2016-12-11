var fs = require('fs');

class DevicePage {
  constructor() {
    this._template = fs.readFileSync('device.html', 'utf-8');
  }

  show(devId, device) {
    var dotPos = devId.indexOf('.');

    console.log(device);
    var $page = $(this._template);
    $('.deviceUser', $page).text(devId.substr(0, dotPos+1));
    $('.deviceId', $page).text(devId.substr(dotPos+1));
    $('.deviceName', $page).text(device.name);
    $('.deviceState', $page).text(device.state);
    $('.deviceIp', $page).text(device.ip);
    $('.deviceClient', $page).text(device.version);


    $('#mainContent').empty();
    $('#mainContent').append($page);
  }
}

module.exports = new DevicePage()
