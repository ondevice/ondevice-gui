var $ = require('jQuery')
var config = require('./config.js')
var EventSource = require('./eventSource.js')

function _clickHandler(ev) {
  var name = this.dataset['name'];

  if (name !== instance._selectedItem.dataset['name']) {
    $(instance._selectedItem).removeClass('active');
    $(this).addClass('active');
    instance._selectedItem = this;
    config.switchClientUser(name);
    instance.ev.fire('userSelected', name);
  }
}

class UserList {
  constructor() {
    this.ev = new EventSource(['userSelected']);
  }

  clear() {
    $('#userList').empty();
  }

  reload() {
    var $list = $('#userList');
    var defaultUser = config.getClientUser()

    this.clear();

    for (var name of config.getClientUsers()) {
      var item = document.createElement('span');
      item.className = 'nav-group-item';
      item.dataset['name'] = name;
      $(item).append('<span class="icon icon-user"></span>');
      $(item).append(document.createTextNode(name));

      if (name === defaultUser) {
        $(item).addClass('active');
        this._selectedItem = item;
      }

      item.addEventListener('click', _clickHandler);

      $list.append(item);
    }
  }
}

var instance = new UserList();
module.exports = instance;
