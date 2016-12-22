const EventEmitter = require('events');
const SockJs = require('sockjs-client');
const config = require('./config.js');
const url = require('url');
var ws = require("nodejs-websocket")

class TunnelClient extends EventEmitter {
  constructor(listener) {
    super();
    this._sock = null;
  }

  _parseMessage(data) {
    var msgType = data.asciiSlice(0, 5);

    if (msgType == 'meta:') {
      // meta messages are text, so decode the rest of the message
      var metaData = data.asciiSlice(5);
      console.log('got meta message: '+metaData);

      if (metaData.startsWith('connected:')) {
        // format: meta:connected:api=v1.1
        emit('connected');
        console.log('tunnel:connected');
      }
      else if (metaData == 'EOF') {
        console.log('tunnel:eof');
        this.emit('eof');
      }
      else {
        console.log('unsupported meta message: '+metaData);
      }
    }
    else if (msgType == 'data:') {
      console.log("got data: " + data.length + " bytes");
      this.emit('gotData', data.slice(5));
    }
    else {
      // TODO print some ascii representation of data
      throw "Unsupported message type";
    }
  }

  connect(devId, protocol, service) {
    var socketUrl = url.format({
//      protocol: "https",
      host: "api.ondevice.io",
      pathname: "/v1.1/connect/websocket",
      query: {
        dev: devId,
        protocol: protocol,
        service: service
      }
    });
    if (!socketUrl.startsWith('//')) throw "The 'url' package apparently changed its behaviour (expected '//...'): "+socketUrl;
    socketUrl = "wss:"+socketUrl;

    var auth = config.getClientUser()+':'+config.getClientAuth();

    this._sock = ws.connect(socketUrl, {
      'extraHeaders': {
        'Authorization': 'Basic '+new Buffer(auth).toString('base64')
      }
    }, function(a,b,c) {
      console.log('onOpen', a, b, c);
    });

    var self = this;
    this._sock.on('binary', function(stream) {
      var data = new Buffer(0);
      stream.on("readable", function() {
           var newData = stream.read()
           if (newData) data = Buffer.concat([data, newData], data.length+newData.length)
       })
       stream.on("end", function() {
           self._parseMessage(data);
       })
    });

    this._sock.on('error', function(err) {
      console.log('socketError', err);
    });
    this._sock.on('close', function(code, reason) {
      console.log('close', code, reason);
    });
  }

  close() {
    this._sock.close();
    this._sock = null;
  }

  write(data) {
    this._sock.send("test");
  }
}

module.exports = TunnelClient;
