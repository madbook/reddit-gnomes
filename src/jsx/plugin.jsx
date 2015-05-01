'use strict';

import store from './store';
import StoreModel from './store-model';

export default class Plugin extends StoreModel {
  static get defaultState() {
    return {
      enabled: true,
    };
  }

  get name() {
    return this.constructor.name;
  }

  get meta() {
    return this.constructor.meta || {};
  }

  constructor() {
    super();
    var { name } = this;
    var initialState = store.state[name];

    var defaultState = {};
    var nextConstructor = this.constructor; 
    var nextDefaultState = nextConstructor.defaultState;

    while (nextDefaultState) {
      Object.assign(defaultState, nextDefaultState)
      nextConstructor = nextConstructor.prototype.__proto__.constructor;
      nextDefaultState = nextConstructor.defaultState;
    }

    Object.assign(defaultState, initialState);
    this.state = defaultState;
  }

  // in subclass methods call `return foo & super.shouldRun();` in subclass methods
  shouldRun() {
    return this.state.enabled;
  }

  _commit() {
    store[this.name] = this.state;
    store._commit();
  }

  setup() {}

  run() {}
}
