var fs = require('fs');
var tabs = require('./tabs.js');
var TerminalPage = require('./terminalPage.js');

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

    // connect buttons
    $('.sshButton', $page).click(function() {
      console.log('opening terminal session to '+devId);

      new TerminalPage().open(devId, {
        user: $('#sshUser', $page).val(),
        password: $('#sshPassword', $page).val()
      });
    })

    $page.tabId = 'device:'+devId;
    $page.tabIcon = 'icon-monitor';
    $page.title = devId;
    tabs.add($page);
  }
}

module.exports = new DevicePage()
