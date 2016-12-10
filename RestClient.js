var $ = require('jQuery');
var fs = require('fs');
var ini = require('ini');

class RestClient {
	constructor() {
		var config = ini.parse(fs.readFileSync(this._getUserHome()+'/.config/ondevice/ondevice.conf', 'utf-8'))
		console.log(config);
		this.user=config.client.user;
		this.auth=config.client.auth;
	}

	_getUserHome() {
		// TODO put me into a 'config' module
		return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
	}

	_getJSON(url, data, callback) {
		// TODO don't hack together URLs
		if (!url.startsWith('/')) throw "Error: 'url' has to start with a '/': "+url;
		url = 'https://'+this.user+':'+this.auth+'@api.ondevice.io/v1.1' + url;

		return $.getJSON(url, data, callback);
	}

	listDevices(callback) {
		this._getJSON('/devices', callback);
	}
};

module.exports = new RestClient();
