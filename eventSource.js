class EventSource {
  constructor(events) {
    this._listeners = {};
    for (var eventName of events) {
        this._listeners[eventName] = [];
    }
  }

  addListener(event, listener) {
    this._listeners[event].push(listener);
  }

  fire(event) {
    var args = [];
    Array.prototype.push.apply(args, arguments);
    args.shift(); // skip the first arg

    for (var listener of this._listeners[event]) {
      listener.apply(null, args);
    }
  }
}


module.exports = EventSource
