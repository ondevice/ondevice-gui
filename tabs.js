var $ = require('jQuery');

function _close(event) {
  var tab = this.parentElement._tab;
  console.log('closing tab: ', tab.title);
  instance.remove(tab);
  event.stopPropagation(); // avoid the `_setActive()` to be invoked as well
}

function _setActive(event) {
  var tab = this._tab;
  instance.setActive(tab);
}

class Tabs {
  _changed() {
    $('.toolbar-header').css({'display': this.getCount() > 1 ? '' : 'none'});
  }

  _createHeader(tab) {
    var $hdr = $('<div class="tab-item"><span class="icon icon-cancel icon-close-tab"></span></div>');

    if (tab.tabIcon !== undefined) {
      var icon = document.createElement('span');
      icon.className = 'icon '+tab.tabIcon;
      $hdr.append(icon);
    }
    $hdr[0]._title = document.createTextNode(' '+tab.title);
    $hdr.append($hdr[0]._title);

    $('span', $hdr).click(_close);
    $hdr.click(_setActive);

    return this._updateHeader($hdr[0], tab);
  }

  _updateHeader(hdr, tab) {
    hdr._title.nodeValue = ' '+tab.title;
    hdr._tab = tab;
    tab._header = hdr;
    return hdr;
  }

  add(tab, setActive) {
    if (setActive === undefined) setActive = true;

    var tabs = $('#tabs')[0];

    if (tab.tabId !== undefined) {
      var tabId = tab.tabId;
      if (tabs._tabIds === undefined) tabs._tabIds = {};
      if (tabs._tabIds[tabId] !== undefined) {
        // there's already a tab with that ID -> simply replace it
        var oldTab = tabs._tabIds[tabId];
        var header = oldTab._header;

        this._updateHeader(header, tab);
        tabs._tabIds[tabId] = tab;

        if (setActive) this.setActive(tab);
        return;
      }

      tabs._tabIds[tab.tabId] = tab;
    }

    var hdr = this._createHeader(tab);

    tabs.appendChild(hdr);

    if (setActive || tabs._current === undefined) {
      this.setActive(tab);
    }

    this._changed();
  }

  getCount() {
    return $('#tabs')[0].children.length;
  }

  remove(tab) {
    var tabs = $('#tabs')[0];
    var hdr = tab._header;

    if (tabs._current === tab) {
      // activate next element (or the previous one)
      var next = hdr.nextElementSibling;
      if (next === null) next = hdr.previousElementSibling;
      this.setActive(next._tab);
    }

    if (tab.tabId !== undefined) {
      delete tabs._tabIds[tab.tabId];
    }

    tabs.removeChild(hdr);
    this._changed();
  }

  replace(oldTab, tab) {
    throw "Not yet implemented!!!";
  }

  setActive(tab) {
    var tabs = $('#tabs')[0];

    if (tabs._current) $(tabs._current._header).removeClass('active');

    $('#mainContainer').empty();
    $('#mainContainer').append(tab);

    console.log('active tab: ', tab.title);
    tabs._current = tab;
    $(tab._header).addClass('active');
  }
}

var instance = new Tabs();
module.exports = instance;
