RestClient = require('./RestClient.js');
$ = require('jQuery');

class DeviceList {
	reload() {
		RestClient.listDevices(this._reload);
	}

	_reload(data) {
		var $list = $('#deviceList');
		var onlineDevices = 0;
		$list.empty();

		for (var device of data.devices) {
		//	console.log(device);

			var li = $('<li class="list-group-item">\n'
				+ '<span class="icon icon-monitor pull-left" style="font-size:24px;padding-right:5px" />\n'
				+ '<div class="media-body">\n'
				+ '<strong>device name</strong>\n'
				+ '<p>deviceId</p>\n'
				+ '</div></li>')[0];
			$('strong', li).text(device.name != null ? device.name : device.id);
			$('p', li).text(device.id);
			li.dataset['devId'] = device.id;
			li.dataset['dev'] = device;
			$(li).addClass(device.state);
			$list.append(li);

			if (device.state == 'online') onlineDevices += 1;
		}

		$('#onlineCount').text(onlineDevices+'/'+data.devices.length);
	}
}

module.exports = new DeviceList();
