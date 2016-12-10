var $ = require('jQuery');
var config = require('./config.js')

class RestClient {
	constructor() {
		this.user=config.getClientUser();
		this.auth=config.getClientAuth();
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
