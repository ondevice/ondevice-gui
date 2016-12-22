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

  _onReady(a,b,c) {
    console.log('_onReady', a, b,c);
    this.ssh.shell({
      cols: 80,
      rows: 24,
      host: 'localhost'
    }, this._onConnect.bind(this));
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

    this.tunnel = new TunnelClient();
//    this.tunnel.addListener('eof', )

    rc.style.height='100%';
    rc.tabIcon = 'icon-lock';
    rc.title = "SSH: "+devId;
    tabs.add(rc);

    // set up terminal window
    var term = new xterm();
    term.open(rc);

    // set up connection
    this.ssh = new Client();
    this.ssh.on('ready', this._onReady.bind(this));
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
    this.tab = rc;
    rc._page = this;

    // open the SSH connection (TODO this should only happen after the connection was established)
    if (false) {
      term.write('User: ');
      this._userInputCallback = this._inputUsername.bind(this);
      term.on('key', this._userInputCallback);
    }
    else {
      console.log('SSH user: '+this.username);

      this.terminal.on('key', this._onTermInput.bind(this));
      this.ssh.connect({
        host: 'localhost',
        port: 22,
        tryKeyboard: true,
        username: this.username,
        password: options.password
      });
    }

    $(window).on('resize', function(ev) {
      console.log('onResize', ev);
      term.fit();
    });

    return rc;
  }
}

module.exports = TerminalPage;
