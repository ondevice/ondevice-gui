var tabs = require('./tabs.js');
var TunnelClient = require('./TunnelClient.js');
var Client = require('ssh2').Client;
var xterm = require('xterm');
require('xterm/dist/addons/fit/fit.js');

class TerminalPage {
  _onTermInput(key, ev) {
    this.stream.write(key);
  }

  _onConnect(err, stream) {
    console.log('__onConnect', err, stream);
    this.stream = stream;
    stream.on('close', function() {console.log('closeStream');})
    stream.on('data', this._onSshData.bind(this));
    stream.on('errorData', function(data) {
      console.log('errData: ', data);
    });
    this.terminal.fit();
  }

  _onSshData(data) {
    this.terminal.write(data.toString());
  }

  _onSshReady(a,b,c) {
    console.log('_onSshReady', a, b,c);
    this.ssh.shell({
      cols: 80,
      rows: 24,
      host: 'localhost',
      sock: this.tunnel
    }, this._onConnect.bind(this));
  }

  _onTunnelConnected() {
    // ok, the tunnel's up, let's start SSH
    console.log('Opening SSH connection (as user: '+this.username+')');
    this.ssh.connect({
      sock: this.tunnel,
      tryKeyboard: true,
      username: this.username,
      password: this.password
    });
  }

  _readInput(c) {
    term.write(c);
  }

  open(devId, options) {
    var rc = document.createElement('div');
    if (options == undefined) options = {};

    if (options.user == undefined) throw "Missing SSH username";
    if (options.password == undefined) throw "Missing SSH password";
    this.username = options.user;
    this.password = options.password; // TODO avoid storing the password

    this.tunnel = new TunnelClient();
    this.tunnel.on('connect', this._onTunnelConnected.bind(this));
    this.tunnel.connect({devId: devId, service: 'ssh'}); // TODO make me configurable

    rc.style.height='100%';
    rc.tabIcon = 'icon-lock';
    rc.title = "SSH: "+devId;
    tabs.add(rc);

    // set up terminal window
    var term = new xterm();
    term.open(rc);

    // set up connection
    this.ssh = new Client();
    this.ssh.on('ready', this._onSshReady.bind(this));
    this.ssh.on('banner', function(message, language) {
      console.log('_onBanner:', message, language);
    });
    this.ssh.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish){
      console.log('_onKeyInteractive', name, instructions, instructionsLang, prompts, finish);
    });
    this.ssh.on('error', function(err) {
      console.error('ssh error: ', err);
    });
    this.ssh.on('end', function() {
      console.log('ssh end');
    });
    this.ssh.on('close', function(hadError) {
      console.log('_onClose', hadError);
    });

    // cross-link everything
    this.terminal = term;
    this.terminal.on('key', this._onTermInput.bind(this));
    this.tab = rc;
    rc._page = this;

    $(window).on('resize', function(ev) {
      console.log('onResize', ev);
      term.fit();
    });

    return rc;
  }
}

module.exports = TerminalPage;
