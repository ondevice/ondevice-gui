const EventEmitter = require('events');
const SockJs = require('sockjs-client');
const config = require('./config.js');
const url = require('url');
var ws = require("nodejs-websocket")

/**
 * client side of a tunnel to one of your devices' services
 *
 * This class tries to mimick the behaviour of Node.js's Socket class,
 * but instead of host and port it'll take a devId and service name as
 * targets:
 * https://nodejs.org/api/net.html#net_class_net_socket
 */
class TunnelClient extends EventEmitter {
  constructor() {
    super();
    this._sock = null;
    this.writable = false;
  }

  _onOpen() {
    console.log('onOpen');
  }

  _parseMessage(data) {
    var msgType = data.asciiSlice(0, 5);

    if (msgType == 'meta:') {
      // meta messages are text, so decode the rest of the message
      var metaData = data.asciiSlice(5);
      console.log('got meta message: '+metaData);

      if (metaData.startsWith('connected:')) {
        // format: meta:connected:api=v1.1
        this.emit('connect');
        this.writable = true;
        console.log('tunnel:connected');
      }
      else if (metaData == 'EOF') {
        console.log('tunnel:eof');
        this.emit('end');
      }
      else {
        console.log('unsupported meta message: '+metaData);
      }
    }
    else if (msgType == 'data:') {
      //console.log("got data: " + data.length + " bytes", data.asciiSlice(5));
      this.emit('data', data.slice(5));
    }
    else if (data.asciiSlice(0, 6) === 'error:') {
      var errData = data.asciiSlice(6);
      var colonPos = errData.indexOf(':');
      var code = parseInt(errData.substr(0, colonPos));
      var msg = errData.substr(colonPos+1);
      throw "Tunnel Error "+code+": "+msg;
    }
    else {
      // TODO print some ascii representation of data
      throw "Unsupported message type";
    }
  }

  connect(cfg) {
    // parse cfg's contents
    var devId, protocol, service;
    if (cfg.devId) devId = cfg.devId;
    else if (cfg.host) devId = cfg.host;
    else throw "Missing 'devId' parameter to TunnelClient.connect()";

    if (!cfg.service) throw "Missing 'service' parameter to TunnelClient.connect()";
    else service = cfg.service;

    if (cfg.protocol) protocol = cfg.protocol;
    else protocol = service;

    // prepare socket
    // TODO build API URLs in a central place
    var socketUrl = url.format({
//      protocol: "wss" -- This doesn't work - but by omitting the scheme we can simply prepend it a little further down
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
    }, this._onOpen.bind(this));

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

    this._sock.on('text', function(str) {
      throw "Got text message over the wire!?!: "+str;
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

  pipe(stream) {
    this.on('data', function(chunk) {
      stream.write(chunk);
    });
    this.on('end', stream.end);
  }

  write(data, encoding, callback) {
    if (!this.writable) throw "Wait 'til we're connected please";
    //console.log('TunnelClient.write(): '+data.length+ ' bytes', data.asciiSlice(0), encoding, callback);
    this._sock.send(Buffer.concat([Buffer.from("data:"), data], data.length + 5));
  }
}

module.exports = TunnelClient;
