var $ = require('jQuery');
var config = require('./config.js')

class RestClient {
	constructor() {
	}

	_getJSON(url, data, callback) {
		// TODO don't hack together URLs
		var auth = config.getClientUser()+':'+config.getClientAuth();
		if (!url.startsWith('/')) throw "Error: 'url' has to start with a '/': "+url;
		url = 'https://'+auth+'@api.ondevice.io/v1.1' + url;

		return $.getJSON(url, data, callback);
	}

	listDevices(callback) {
		this._getJSON('/devices', callback);
	}
};

module.exports = new RestClient();
