'use strict';

/**
 * a little localstorage wrapper that we'll use to store plugin state.  saves
 * a plain javascript object to localStorage under the given key (reddit-gnomes)
 * as a JSON string.  As long as the setState and set methods are used, you
 * don't have to worry about manually committing the changes.  Maybe not the
 * most efficient, but hey, it doesn't have to be :)
 */
export default class StoreModel {
  constructor(key) {
    this.key = key;

    if (localStorage[key]) {
      this.state = JSON.parse(localStorage[key]);
    } else {
      this.state = {};
    }
  }

  setState(newState) {
    var willChange = false;
    
    for (var key in newState) {
      if (typeof newState[key] === 'object' || this.state[key] !== newState[key] &&
          !willChange) {
        willChange = true;
      }

      this.state[key] = newState[key];
    }

    if (willChange) {
      this._commit();
    }
  }

  set(key, val) {
    var parts = key.split('/');
    var target = this.state;
    var l = parts.length - 1;
    for (var i = 0; i < l; i++) {
      if (target && target instanceof Object) {
        target = target[parts[i]];
      } else {
        throw `invalid path, ${parts[i]} is not an object!`;
      }
    }

    key = parts[l];

    if (target[key] !== val) {
      target[key] = val;
      this._commit();
    }
  }

  _commit() {
    localStorage[this.key] = JSON.stringify(this.state);
  }

  keys() {
    return Object.keys(this.state);
  }
}
