var fs = require('fs')
var ini = require('ini')

class Config {
  constructor() {
    this._reload();
  }

  _reload() {
    this._selectedUser = null;
    this._config = ini.parse(fs.readFileSync(this.getHomeDir()+'/.config/ondevice/ondevice.conf', 'utf-8'));

    // create an `auth_{username}` entry for the default user
    this._config.client['auth_'+this.getClientUser()] = this.getClientAuth();
  }

  /// Determines the user's home directory
  getHomeDir() {
		return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  /// Get the name of the selected client user
  getClientUser() {
    if (this._selectedUser !== null) return this._selectedUser;
    return this._config.client.user;
  }

  /// Get the authentication key of the selected client user
  getClientAuth() {
    if (this._selectedUser !== null) return this._config.client['auth_'+this._selectedUser];
    return this._config.client.auth;
  }

  /// Get list of configured client users (the default one plus any 'auth_*' config keys)
  getClientUsers() {
    var rc = {};
    rc[this.getClientUser()] = null;

    for (var key of Object.keys(this._config.client)) {
      if (key.startsWith('auth_')) {
        var name = key.substr(5);
        rc[name] = null;
      }
    }

    return Object.keys(rc).sort();
  }

  /// select another client user (if configured). getClientUser() and getClientAuth()
  /// will return that user's credentials from that point on
  switchClientUser(name) {
    if (name === this._config.client.user) {
      // we're back to the default user
      this._selectedUser = null;
    }
    else {
      if (this._config.client['auth_'+name] === undefined) {
        throw "Unknown client user: "+name;
      }

      this._selectedUser = name;
    }
  }
}

module.exports = new Config()
