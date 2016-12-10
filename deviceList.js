EventSource = require('./eventSource.js');
restClient = require('./restClient.js');
$ = require('jQuery');

var instance = null;

function _clickHandler(ev) {
	if (instance._selectedItem != undefined) {
		$(instance._selectedItem).removeClass('selected');
	}
	instance._selectedItem = this;
	$(this).addClass('selected');
	instance.ev.fire('deviceSelected', this.dataset['devId']);
}

function _reload(data) {
	var $list = $('#deviceList');
	var onlineDevices = 0;

	instance.clear();

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
		$(li).addClass('device');
		$list.append(li);

		if (device.state == 'online') onlineDevices += 1;

		li.addEventListener('click', _clickHandler);
		instance._items[device.id] = li;
	}

	$('#onlineCount').text(onlineDevices+'/'+data.devices.length);
}

class DeviceList {
	constructor() {
		this.ev = new EventSource(['deviceSelected']);
	}

	clear() {
		$('#deviceList').empty();
		this._selectedItem = undefined;
		this._items = {};
	}

	reload() {
		restClient.listDevices(_reload);
	}

	_deviceSelected() {
		console.log('deviceSelected');
		console.log(this);
	}
}

instance = new DeviceList();
module.exports = instance;
