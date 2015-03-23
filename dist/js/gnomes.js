(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");
require("regenerator-babel/runtime");

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"core-js/shim":2,"regenerator-babel/runtime":3}],2:[function(require,module,exports){
/**
 * Core.js 0.5.4
 * https://github.com/zloirock/core-js
 * License: http://rock.mit-license.org
 * © 2015 Denis Pushkarev
 */
!function(global, framework, undefined){
'use strict';

/******************************************************************************
 * Module : common                                                            *
 ******************************************************************************/

  // Shortcuts for [[Class]] & property names
var OBJECT          = 'Object'
  , FUNCTION        = 'Function'
  , ARRAY           = 'Array'
  , STRING          = 'String'
  , NUMBER          = 'Number'
  , REGEXP          = 'RegExp'
  , DATE            = 'Date'
  , MAP             = 'Map'
  , SET             = 'Set'
  , WEAKMAP         = 'WeakMap'
  , WEAKSET         = 'WeakSet'
  , SYMBOL          = 'Symbol'
  , PROMISE         = 'Promise'
  , MATH            = 'Math'
  , ARGUMENTS       = 'Arguments'
  , PROTOTYPE       = 'prototype'
  , CONSTRUCTOR     = 'constructor'
  , TO_STRING       = 'toString'
  , TO_STRING_TAG   = TO_STRING + 'Tag'
  , TO_LOCALE       = 'toLocaleString'
  , HAS_OWN         = 'hasOwnProperty'
  , FOR_EACH        = 'forEach'
  , ITERATOR        = 'iterator'
  , FF_ITERATOR     = '@@' + ITERATOR
  , PROCESS         = 'process'
  , CREATE_ELEMENT  = 'createElement'
  // Aliases global objects and prototypes
  , Function        = global[FUNCTION]
  , Object          = global[OBJECT]
  , Array           = global[ARRAY]
  , String          = global[STRING]
  , Number          = global[NUMBER]
  , RegExp          = global[REGEXP]
  , Date            = global[DATE]
  , Map             = global[MAP]
  , Set             = global[SET]
  , WeakMap         = global[WEAKMAP]
  , WeakSet         = global[WEAKSET]
  , Symbol          = global[SYMBOL]
  , Math            = global[MATH]
  , TypeError       = global.TypeError
  , RangeError      = global.RangeError
  , setTimeout      = global.setTimeout
  , setImmediate    = global.setImmediate
  , clearImmediate  = global.clearImmediate
  , parseInt        = global.parseInt
  , isFinite        = global.isFinite
  , process         = global[PROCESS]
  , nextTick        = process && process.nextTick
  , document        = global.document
  , html            = document && document.documentElement
  , navigator       = global.navigator
  , define          = global.define
  , ArrayProto      = Array[PROTOTYPE]
  , ObjectProto     = Object[PROTOTYPE]
  , FunctionProto   = Function[PROTOTYPE]
  , Infinity        = 1 / 0
  , DOT             = '.'
  // Methods from https://github.com/DeveloperToolsWG/console-object/blob/master/api.md
  , CONSOLE_METHODS = 'assert,clear,count,debug,dir,dirxml,error,exception,' +
      'group,groupCollapsed,groupEnd,info,isIndependentlyComposed,log,' +
      'markTimeline,profile,profileEnd,table,time,timeEnd,timeline,' +
      'timelineEnd,timeStamp,trace,warn';

// http://jsperf.com/core-js-isobject
function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
// Native function?
var isNative = ctx(/./.test, /\[native code\]\s*\}\s*$/, 1);

// Object internal [[Class]] or toStringTag
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring
var toString = ObjectProto[TO_STRING];
function setToStringTag(it, tag, stat){
  if(it && !has(it = stat ? it : it[PROTOTYPE], SYMBOL_TAG))hidden(it, SYMBOL_TAG, tag);
}
function cof(it){
  return toString.call(it).slice(8, -1);
}
function classof(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[SYMBOL_TAG]) == 'string' ? T : cof(O);
}

// Function
var call  = FunctionProto.call
  , apply = FunctionProto.apply
  , REFERENCE_GET;
// Partial apply
function part(/* ...args */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , args   = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((args[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , i = 0, j = 0, _args;
    if(!holder && !_length)return invoke(fn, args, that);
    _args = args.slice();
    if(holder)for(;length > i; i++)if(_args[i] === _)_args[i] = arguments[j++];
    while(_length > j)_args.push(arguments[j++]);
    return invoke(fn, _args, that);
  }
}
// Optional / simple context binding
function ctx(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    }
    case 2: return function(a, b){
      return fn.call(that, a, b);
    }
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    }
  } return function(/* ...args */){
      return fn.apply(that, arguments);
  }
}
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
function invoke(fn, args, that){
  var un = that === undefined;
  switch(args.length | 0){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
}
function construct(target, argumentsList /*, newTarget*/){
  var proto    = assertFunction(arguments.length < 3 ? target : arguments[2])[PROTOTYPE]
    , instance = create(isObject(proto) ? proto : ObjectProto)
    , result   = apply.call(target, instance, argumentsList);
  return isObject(result) ? result : instance;
}

// Object:
var create           = Object.create
  , getPrototypeOf   = Object.getPrototypeOf
  , setPrototypeOf   = Object.setPrototypeOf
  , defineProperty   = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnDescriptor = Object.getOwnPropertyDescriptor
  , getKeys          = Object.keys
  , getNames         = Object.getOwnPropertyNames
  , getSymbols       = Object.getOwnPropertySymbols
  , isFrozen         = Object.isFrozen
  , has              = ctx(call, ObjectProto[HAS_OWN], 2)
  // Dummy, fix for not array-like ES3 string in es5 module
  , ES5Object        = Object
  , Dict;
function toObject(it){
  return ES5Object(assertDefined(it));
}
function returnIt(it){
  return it;
}
function returnThis(){
  return this;
}
function get(object, key){
  if(has(object, key))return object[key];
}
function ownKeys(it){
  assertObject(it);
  return getSymbols ? getNames(it).concat(getSymbols(it)) : getNames(it);
}
// 19.1.2.1 Object.assign(target, source, ...)
var assign = Object.assign || function(target, source){
  var T = Object(assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = ES5Object(arguments[i++])
      , keys   = getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
}
function keyOf(object, el){
  var O      = toObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
}

// Array
// array('str1,str2,str3') => ['str1', 'str2', 'str3']
function array(it){
  return String(it).split(',');
}
var push    = ArrayProto.push
  , unshift = ArrayProto.unshift
  , slice   = ArrayProto.slice
  , splice  = ArrayProto.splice
  , indexOf = ArrayProto.indexOf
  , forEach = ArrayProto[FOR_EACH];
/*
 * 0 -> forEach
 * 1 -> map
 * 2 -> filter
 * 3 -> some
 * 4 -> every
 * 5 -> find
 * 6 -> findIndex
 */
function createArrayMethod(type){
  var isMap       = type == 1
    , isFilter    = type == 2
    , isSome      = type == 3
    , isEvery     = type == 4
    , isFindIndex = type == 6
    , noholes     = type == 5 || isFindIndex;
  return function(callbackfn/*, that = undefined */){
    var O      = Object(assertDefined(this))
      , that   = arguments[1]
      , self   = ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = isMap ? Array(length) : isFilter ? [] : undefined
      , val, res;
    for(;length > index; index++)if(noholes || index in self){
      val = self[index];
      res = f(val, index, O);
      if(type){
        if(isMap)result[index] = res;             // map
        else if(res)switch(type){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(isEvery)return false;           // every
      }
    }
    return isFindIndex ? -1 : isSome || isEvery ? isEvery : result;
  }
}
function createArrayContains(isContains){
  return function(el /*, fromIndex = 0 */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = toIndex(arguments[1], length);
    if(isContains && el != el){
      for(;length > index; index++)if(sameNaN(O[index]))return isContains || index;
    } else for(;length > index; index++)if(isContains || index in O){
      if(O[index] === el)return isContains || index;
    } return !isContains && -1;
  }
}
function generic(A, B){
  // strange IE quirks mode bug -> use typeof vs isFunction
  return typeof A == 'function' ? A : B;
}

// Math
var MAX_SAFE_INTEGER = 0x1fffffffffffff // pow(2, 53) - 1 == 9007199254740991
  , pow    = Math.pow
  , abs    = Math.abs
  , ceil   = Math.ceil
  , floor  = Math.floor
  , max    = Math.max
  , min    = Math.min
  , random = Math.random
  , trunc  = Math.trunc || function(it){
      return (it > 0 ? floor : ceil)(it);
    }
// 20.1.2.4 Number.isNaN(number)
function sameNaN(number){
  return number != number;
}
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it) ? 0 : trunc(it);
}
// 7.1.15 ToLength
function toLength(it){
  return it > 0 ? min(toInteger(it), MAX_SAFE_INTEGER) : 0;
}
function toIndex(index, length){
  var index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
}
function lz(num){
  return num > 9 ? num : '0' + num;
}

function createReplacer(regExp, replace, isStatic){
  var replacer = isObject(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  }
}
function createPointAt(toString){
  return function(pos){
    var s = String(assertDefined(this))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return toString ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? toString ? s.charAt(i) : a
      : toString ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  }
}

// Assertion & errors
var REDUCE_ERROR = 'Reduce of empty object with no initial value';
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
function assertDefined(it){
  if(it == undefined)throw TypeError('Function called on null or undefined');
  return it;
}
function assertFunction(it){
  assert(isFunction(it), it, ' is not a function!');
  return it;
}
function assertObject(it){
  assert(isObject(it), it, ' is not an object!');
  return it;
}
function assertInstance(it, Constructor, name){
  assert(it instanceof Constructor, name, ": use the 'new' operator!");
}

// Property descriptors & Symbol
function descriptor(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  }
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return defineProperty(object, key, descriptor(bitmap, value));
  } : simpleSet;
}
function uid(key){
  return SYMBOL + '(' + key + ')_' + (++sid + random())[TO_STRING](36);
}
function getWellKnownSymbol(name, setter){
  return (Symbol && Symbol[name]) || (setter ? Symbol : safeSymbol)(SYMBOL + DOT + name);
}
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
      try {
        return defineProperty({}, 'a', {get: function(){ return 2 }}).a == 2;
      } catch(e){}
    }()
  , sid    = 0
  , hidden = createDefiner(1)
  , set    = Symbol ? simpleSet : hidden
  , safeSymbol = Symbol || uid;
function assignHidden(target, src){
  for(var key in src)hidden(target, key, src[key]);
  return target;
}

var SYMBOL_UNSCOPABLES = getWellKnownSymbol('unscopables')
  , ArrayUnscopables   = ArrayProto[SYMBOL_UNSCOPABLES] || {}
  , SYMBOL_SPECIES     = getWellKnownSymbol('species');
function setSpecies(C){
  if(framework || !isNative(C))defineProperty(C, SYMBOL_SPECIES, {
    configurable: true,
    get: returnThis
  });
}

// Iterators
var SYMBOL_ITERATOR = getWellKnownSymbol(ITERATOR)
  , SYMBOL_TAG      = getWellKnownSymbol(TO_STRING_TAG)
  , SUPPORT_FF_ITER = FF_ITERATOR in ArrayProto
  , ITER  = safeSymbol('iter')
  , KEY   = 1
  , VALUE = 2
  , Iterators = {}
  , IteratorPrototype = {}
  , NATIVE_ITERATORS = SYMBOL_ITERATOR in ArrayProto
    // Safari define byggy iterators w/o `next`
  , BUGGY_ITERATORS = 'keys' in ArrayProto && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, returnThis);
function setIterator(O, value){
  hidden(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  SUPPORT_FF_ITER && hidden(O, FF_ITERATOR, value);
}
function createIterator(Constructor, NAME, next, proto){
  Constructor[PROTOTYPE] = create(proto || IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor[PROTOTYPE]
    , iter  = get(proto, SYMBOL_ITERATOR) || get(proto, FF_ITERATOR) || (DEFAULT && get(proto, DEFAULT)) || value;
  if(framework){
    // Define iterator
    setIterator(proto, iter);
    if(iter !== value){
      var iterProto = getPrototypeOf(iter.call(new Constructor));
      // Set @@toStringTag to native iterators
      setToStringTag(iterProto, NAME + ' Iterator', true);
      // FF fix
      has(proto, FF_ITERATOR) && setIterator(iterProto, returnThis);
    }
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = returnThis;
  return iter;
}
function defineStdIterators(Base, NAME, Constructor, next, DEFAULT, IS_SET){
  function createIter(kind){
    return function(){
      return new Constructor(this, kind);
    }
  }
  createIterator(Constructor, NAME, next);
  var entries = createIter(KEY+VALUE)
    , values  = createIter(VALUE);
  if(DEFAULT == VALUE)values = defineIterator(Base, NAME, values, 'values');
  else entries = defineIterator(Base, NAME, entries, 'entries');
  if(DEFAULT){
    $define(PROTO + FORCED * BUGGY_ITERATORS, NAME, {
      entries: entries,
      keys: IS_SET ? values : createIter(KEY),
      values: values
    });
  }
}
function iterResult(done, value){
  return {value: value, done: !!done};
}
function isIterable(it){
  var O      = Object(it)
    , Symbol = global[SYMBOL]
    , hasExt = (Symbol && Symbol[ITERATOR] || FF_ITERATOR) in O;
  return hasExt || SYMBOL_ITERATOR in O || has(Iterators, classof(O));
}
function getIterator(it){
  var Symbol  = global[SYMBOL]
    , ext     = it[Symbol && Symbol[ITERATOR] || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[classof(it)];
  return assertObject(getIter.call(it));
}
function stepCall(fn, value, entries){
  return entries ? invoke(fn, value) : fn(value);
}
function forOf(iterable, entries, fn, that){
  var iterator = getIterator(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done)if(stepCall(f, step.value, entries) === false)return;
}

// core
var NODE = cof(process) == PROCESS
  , core = {}
  , path = framework ? global : core
  , old  = global.core
  , exportGlobal
  // type bitmap
  , FORCED = 1
  , GLOBAL = 2
  , STATIC = 4
  , PROTO  = 8
  , BIND   = 16
  , WRAP   = 32
  , SIMPLE = 64;
function $define(type, name, source){
  var key, own, out, exp
    , isGlobal = type & GLOBAL
    , target   = isGlobal ? global : (type & STATIC)
        ? global[name] : (global[name] || ObjectProto)[PROTOTYPE]
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // there is a similar native
    own = !(type & FORCED) && target && key in target
      && (!isFunction(target[key]) || isNative(target[key]));
    // export native or passed
    out = (own ? target : source)[key];
    // prevent global pollution for namespaces
    if(!framework && isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & BIND && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & WRAP && !framework && target[key] == out){
      exp = function(param){
        return this instanceof out ? new out(param) : out(param);
      }
      exp[PROTOTYPE] = out[PROTOTYPE];
    } else exp = type & PROTO && isFunction(out) ? ctx(call, out) : out;
    // extend global
    if(framework && target && !own){
      if(isGlobal || type & SIMPLE)target[key] = out;
      else delete target[key] && hidden(target, key, out);
    }
    // export
    if(exports[key] != out)hidden(exports, key, exp);
  }
}
// CommonJS export
if(typeof module != 'undefined' && module.exports)module.exports = core;
// RequireJS export
else if(isFunction(define) && define.amd)define(function(){return core});
// Export to global object
else exportGlobal = true;
if(exportGlobal || framework){
  core.noConflict = function(){
    global.core = old;
    return core;
  }
  global.core = core;
}

/******************************************************************************
 * Module : es6.symbol                                                        *
 ******************************************************************************/

// ECMAScript 6 symbols shim
!function(TAG, SymbolRegistry, AllSymbols, setter){
  // 19.4.1.1 Symbol([description])
  if(!isNative(Symbol)){
    Symbol = function(description){
      assert(!(this instanceof Symbol), SYMBOL + ' is not a ' + CONSTRUCTOR);
      var tag = uid(description)
        , sym = set(create(Symbol[PROTOTYPE]), TAG, tag);
      AllSymbols[tag] = sym;
      DESC && setter && defineProperty(ObjectProto, tag, {
        configurable: true,
        set: function(value){
          hidden(this, tag, value);
        }
      });
      return sym;
    }
    hidden(Symbol[PROTOTYPE], TO_STRING, function(){
      return this[TAG];
    });
  }
  $define(GLOBAL + WRAP, {Symbol: Symbol});
  
  var symbolStatics = {
    // 19.4.2.1 Symbol.for(key)
    'for': function(key){
      return has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = Symbol(key);
    },
    // 19.4.2.4 Symbol.iterator
    iterator: SYMBOL_ITERATOR,
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: part.call(keyOf, SymbolRegistry),
    // 19.4.2.10 Symbol.species
    species: SYMBOL_SPECIES,
    // 19.4.2.13 Symbol.toStringTag
    toStringTag: SYMBOL_TAG = getWellKnownSymbol(TO_STRING_TAG, true),
    // 19.4.2.14 Symbol.unscopables
    unscopables: SYMBOL_UNSCOPABLES,
    pure: safeSymbol,
    set: set,
    useSetter: function(){setter = true},
    useSimple: function(){setter = false}
  };
  // 19.4.2.2 Symbol.hasInstance
  // 19.4.2.3 Symbol.isConcatSpreadable
  // 19.4.2.6 Symbol.match
  // 19.4.2.8 Symbol.replace
  // 19.4.2.9 Symbol.search
  // 19.4.2.11 Symbol.split
  // 19.4.2.12 Symbol.toPrimitive
  forEach.call(array('hasInstance,isConcatSpreadable,match,replace,search,split,toPrimitive'),
    function(it){
      symbolStatics[it] = getWellKnownSymbol(it);
    }
  );
  $define(STATIC, SYMBOL, symbolStatics);
  
  setToStringTag(Symbol, SYMBOL);
  
  $define(STATIC + FORCED * !isNative(Symbol), OBJECT, {
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
      return result;
    },
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: function(it){
      var names = getNames(toObject(it)), result = [], key, i = 0;
      while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
      return result;
    }
  });
}(safeSymbol('tag'), {}, {}, true);

/******************************************************************************
 * Module : es6.object                                                        *
 ******************************************************************************/

!function(tmp){
  var objectStatic = {
    // 19.1.3.1 Object.assign(target, source)
    assign: assign,
    // 19.1.3.10 Object.is(value1, value2)
    is: function(x, y){
      return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
    }
  };
  // 19.1.3.19 Object.setPrototypeOf(O, proto)
  // Works with __proto__ only. Old v8 can't works with null proto objects.
  '__proto__' in ObjectProto && function(buggy, set){
    try {
      set = ctx(call, getOwnDescriptor(ObjectProto, '__proto__').set, 2);
      set({}, ArrayProto);
    } catch(e){ buggy = true }
    objectStatic.setPrototypeOf = setPrototypeOf = setPrototypeOf || function(O, proto){
      assertObject(O);
      assert(proto === null || isObject(proto), proto, ": can't set as prototype!");
      if(buggy)O.__proto__ = proto;
      else set(O, proto);
      return O;
    }
  }();
  $define(STATIC, OBJECT, objectStatic);
  
  if(framework){
    // 19.1.3.6 Object.prototype.toString()
    tmp[SYMBOL_TAG] = DOT;
    if(cof(tmp) != DOT)hidden(ObjectProto, TO_STRING, function(){
      return '[object ' + classof(this) + ']';
    });
  }
  
  // 20.2.1.9 Math[@@toStringTag]
  setToStringTag(Math, MATH, true);
  // 24.3.3 JSON[@@toStringTag]
  setToStringTag(global.JSON, 'JSON', true);
}({});

/******************************************************************************
 * Module : es6.object.statics-accept-primitives                              *
 ******************************************************************************/

!function(){
  // Object static methods accept primitives
  function wrapObjectMethod(key, MODE){
    var fn  = Object[key]
      , exp = core[OBJECT][key]
      , f   = 0
      , o   = {};
    if(!exp || isNative(exp)){
      o[key] = MODE == 1 ? function(it){
        return isObject(it) ? fn(it) : it;
      } : MODE == 2 ? function(it){
        return isObject(it) ? fn(it) : true;
      } : MODE == 3 ? function(it){
        return isObject(it) ? fn(it) : false;
      } : MODE == 4 ? function(it, key){
        return fn(toObject(it), key);
      } : function(it){
        return fn(toObject(it));
      };
      try { fn(DOT) }
      catch(e){ f = 1 }
      $define(STATIC + FORCED * f, OBJECT, o);
    }
  }
  wrapObjectMethod('freeze', 1);
  wrapObjectMethod('seal', 1);
  wrapObjectMethod('preventExtensions', 1);
  wrapObjectMethod('isFrozen', 2);
  wrapObjectMethod('isSealed', 2);
  wrapObjectMethod('isExtensible', 3);
  wrapObjectMethod('getOwnPropertyDescriptor', 4);
  wrapObjectMethod('getPrototypeOf');
  wrapObjectMethod('keys');
  wrapObjectMethod('getOwnPropertyNames');
}();

/******************************************************************************
 * Module : es6.function                                                      *
 ******************************************************************************/

!function(NAME){
  // 19.2.4.2 name
  NAME in FunctionProto || defineProperty(FunctionProto, NAME, {
    configurable: true,
    get: function(){
      var match = String(this).match(/^\s*function ([^ (]*)/)
        , name  = match ? match[1] : '';
      has(this, NAME) || defineProperty(this, NAME, descriptor(5, name));
      return name;
    },
    set: function(value){
      has(this, NAME) || defineProperty(this, NAME, descriptor(0, value));
    }
  });
}('name');

/******************************************************************************
 * Module : es6.number.constructor                                            *
 ******************************************************************************/

Number('0o1') && Number('0b1') || function(_Number, NumberProto){
  function toNumber(it){
    if(isObject(it))it = toPrimitive(it);
    if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
      var binary = false;
      switch(it.charCodeAt(1)){
        case 66 : case 98  : binary = true;
        case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
      }
    } return +it;
  }
  function toPrimitive(it){
    var fn, val;
    if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
    if(isFunction(fn = it[TO_STRING]) && !isObject(val = fn.call(it)))return val;
    throw TypeError("Can't convert object to number");
  }
  Number = function Number(it){
    return this instanceof Number ? new _Number(toNumber(it)) : toNumber(it);
  }
  forEach.call(DESC ? getNames(_Number)
  : array('MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY'), function(key){
    key in Number || defineProperty(Number, key, getOwnDescriptor(_Number, key));
  });
  Number[PROTOTYPE] = NumberProto;
  NumberProto[CONSTRUCTOR] = Number;
  hidden(global, NUMBER, Number);
}(Number, Number[PROTOTYPE]);

/******************************************************************************
 * Module : es6.number                                                        *
 ******************************************************************************/

!function(isInteger){
  $define(STATIC, NUMBER, {
    // 20.1.2.1 Number.EPSILON
    EPSILON: pow(2, -52),
    // 20.1.2.2 Number.isFinite(number)
    isFinite: function(it){
      return typeof it == 'number' && isFinite(it);
    },
    // 20.1.2.3 Number.isInteger(number)
    isInteger: isInteger,
    // 20.1.2.4 Number.isNaN(number)
    isNaN: sameNaN,
    // 20.1.2.5 Number.isSafeInteger(number)
    isSafeInteger: function(number){
      return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
    },
    // 20.1.2.6 Number.MAX_SAFE_INTEGER
    MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
    // 20.1.2.10 Number.MIN_SAFE_INTEGER
    MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
    // 20.1.2.12 Number.parseFloat(string)
    parseFloat: parseFloat,
    // 20.1.2.13 Number.parseInt(string, radix)
    parseInt: parseInt
  });
// 20.1.2.3 Number.isInteger(number)
}(Number.isInteger || function(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
});

/******************************************************************************
 * Module : es6.math                                                          *
 ******************************************************************************/

// ECMAScript 6 shim
!function(){
  // 20.2.2.28 Math.sign(x)
  var E    = Math.E
    , exp  = Math.exp
    , log  = Math.log
    , sqrt = Math.sqrt
    , sign = Math.sign || function(x){
        return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
      };
  
  // 20.2.2.5 Math.asinh(x)
  function asinh(x){
    return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
  }
  // 20.2.2.14 Math.expm1(x)
  function expm1(x){
    return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
  }
    
  $define(STATIC, MATH, {
    // 20.2.2.3 Math.acosh(x)
    acosh: function(x){
      return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
    },
    // 20.2.2.5 Math.asinh(x)
    asinh: asinh,
    // 20.2.2.7 Math.atanh(x)
    atanh: function(x){
      return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
    },
    // 20.2.2.9 Math.cbrt(x)
    cbrt: function(x){
      return sign(x = +x) * pow(abs(x), 1 / 3);
    },
    // 20.2.2.11 Math.clz32(x)
    clz32: function(x){
      return (x >>>= 0) ? 32 - x[TO_STRING](2).length : 32;
    },
    // 20.2.2.12 Math.cosh(x)
    cosh: function(x){
      return (exp(x = +x) + exp(-x)) / 2;
    },
    // 20.2.2.14 Math.expm1(x)
    expm1: expm1,
    // 20.2.2.16 Math.fround(x)
    // TODO: fallback for IE9-
    fround: function(x){
      return new Float32Array([x])[0];
    },
    // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
    hypot: function(value1, value2){
      var sum  = 0
        , len1 = arguments.length
        , len2 = len1
        , args = Array(len1)
        , larg = -Infinity
        , arg;
      while(len1--){
        arg = args[len1] = +arguments[len1];
        if(arg == Infinity || arg == -Infinity)return Infinity;
        if(arg > larg)larg = arg;
      }
      larg = arg || 1;
      while(len2--)sum += pow(args[len2] / larg, 2);
      return larg * sqrt(sum);
    },
    // 20.2.2.18 Math.imul(x, y)
    imul: function(x, y){
      var UInt16 = 0xffff
        , xn = +x
        , yn = +y
        , xl = UInt16 & xn
        , yl = UInt16 & yn;
      return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
    },
    // 20.2.2.20 Math.log1p(x)
    log1p: function(x){
      return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
    },
    // 20.2.2.21 Math.log10(x)
    log10: function(x){
      return log(x) / Math.LN10;
    },
    // 20.2.2.22 Math.log2(x)
    log2: function(x){
      return log(x) / Math.LN2;
    },
    // 20.2.2.28 Math.sign(x)
    sign: sign,
    // 20.2.2.30 Math.sinh(x)
    sinh: function(x){
      return (abs(x = +x) < 1) ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
    },
    // 20.2.2.33 Math.tanh(x)
    tanh: function(x){
      var a = expm1(x = +x)
        , b = expm1(-x);
      return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
    },
    // 20.2.2.34 Math.trunc(x)
    trunc: trunc
  });
}();

/******************************************************************************
 * Module : es6.string                                                        *
 ******************************************************************************/

!function(fromCharCode){
  function assertNotRegExp(it){
    if(cof(it) == REGEXP)throw TypeError();
  }
  
  $define(STATIC, STRING, {
    // 21.1.2.2 String.fromCodePoint(...codePoints)
    fromCodePoint: function(x){
      var res = []
        , len = arguments.length
        , i   = 0
        , code
      while(len > i){
        code = +arguments[i++];
        if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
        res.push(code < 0x10000
          ? fromCharCode(code)
          : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
        );
      } return res.join('');
    },
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function(callSite){
      var raw = toObject(callSite.raw)
        , len = toLength(raw.length)
        , sln = arguments.length
        , res = []
        , i   = 0;
      while(len > i){
        res.push(String(raw[i++]));
        if(i < sln)res.push(String(arguments[i]));
      } return res.join('');
    }
  });
  
  $define(PROTO, STRING, {
    // 21.1.3.3 String.prototype.codePointAt(pos)
    codePointAt: createPointAt(false),
    // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
    endsWith: function(searchString /*, endPosition = @length */){
      assertNotRegExp(searchString);
      var that = String(assertDefined(this))
        , endPosition = arguments[1]
        , len = toLength(that.length)
        , end = endPosition === undefined ? len : min(toLength(endPosition), len);
      searchString += '';
      return that.slice(end - searchString.length, end) === searchString;
    },
    // 21.1.3.7 String.prototype.includes(searchString, position = 0)
    includes: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      return !!~String(assertDefined(this)).indexOf(searchString, arguments[1]);
    },
    // 21.1.3.13 String.prototype.repeat(count)
    repeat: function(count){
      var str = String(assertDefined(this))
        , res = ''
        , n   = toInteger(count);
      if(0 > n || n == Infinity)throw RangeError("Count can't be negative");
      for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
      return res;
    },
    // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
    startsWith: function(searchString /*, position = 0 */){
      assertNotRegExp(searchString);
      var that  = String(assertDefined(this))
        , index = toLength(min(arguments[1], that.length));
      searchString += '';
      return that.slice(index, index + searchString.length) === searchString;
    }
  });
}(String.fromCharCode);

/******************************************************************************
 * Module : es6.array                                                         *
 ******************************************************************************/

!function(){
  $define(STATIC, ARRAY, {
    // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
    from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
      var O       = Object(assertDefined(arrayLike))
        , mapfn   = arguments[1]
        , mapping = mapfn !== undefined
        , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
        , index   = 0
        , length, result, iter, step;
      if(isIterable(O))for(iter = getIterator(O), result = new (generic(this, Array)); !(step = iter.next()).done; index++){
        result[index] = mapping ? f(step.value, index) : step.value;
      } else for(result = new (generic(this, Array))(length = toLength(O.length)); length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
      result.length = index;
      return result;
    },
    // 22.1.2.3 Array.of( ...items)
    of: function(/* ...args */){
      var index  = 0
        , length = arguments.length
        , result = new (generic(this, Array))(length);
      while(length > index)result[index] = arguments[index++];
      result.length = length;
      return result;
    }
  });
  
  $define(PROTO, ARRAY, {
    // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
    copyWithin: function(target /* = 0 */, start /* = 0, end = @length */){
      var O     = Object(assertDefined(this))
        , len   = toLength(O.length)
        , to    = toIndex(target, len)
        , from  = toIndex(start, len)
        , end   = arguments[2]
        , fin   = end === undefined ? len : toIndex(end, len)
        , count = min(fin - from, len - to)
        , inc   = 1;
      if(from < to && to < from + count){
        inc  = -1;
        from = from + count - 1;
        to   = to + count - 1;
      }
      while(count-- > 0){
        if(from in O)O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    },
    // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
    fill: function(value /*, start = 0, end = @length */){
      var O      = Object(assertDefined(this))
        , length = toLength(O.length)
        , index  = toIndex(arguments[1], length)
        , end    = arguments[2]
        , endPos = end === undefined ? length : toIndex(end, length);
      while(endPos > index)O[index++] = value;
      return O;
    },
    // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
    find: createArrayMethod(5),
    // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
    findIndex: createArrayMethod(6)
  });
  
  if(framework){
    // 22.1.3.31 Array.prototype[@@unscopables]
    forEach.call(array('find,findIndex,fill,copyWithin,entries,keys,values'), function(it){
      ArrayUnscopables[it] = true;
    });
    SYMBOL_UNSCOPABLES in ArrayProto || hidden(ArrayProto, SYMBOL_UNSCOPABLES, ArrayUnscopables);
  }  
  
  setSpecies(Array);
}();

/******************************************************************************
 * Module : es6.iterators                                                     *
 ******************************************************************************/

!function(at){
  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  defineStdIterators(Array, ARRAY, function(iterated, kind){
    set(this, ITER, {o: toObject(iterated), i: 0, k: kind});
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , kind  = iter.k
      , index = iter.i++;
    if(!O || index >= O.length){
      iter.o = undefined;
      return iterResult(1);
    }
    if(kind == KEY)  return iterResult(0, index);
    if(kind == VALUE)return iterResult(0, O[index]);
                     return iterResult(0, [index, O[index]]);
  }, VALUE);
  
  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  Iterators[ARGUMENTS] = Iterators[ARRAY];
  
  // 21.1.3.27 String.prototype[@@iterator]()
  defineStdIterators(String, STRING, function(iterated){
    set(this, ITER, {o: String(iterated), i: 0});
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function(){
    var iter  = this[ITER]
      , O     = iter.o
      , index = iter.i
      , point;
    if(index >= O.length)return iterResult(1);
    point = at.call(O, index);
    iter.i += point.length;
    return iterResult(0, point);
  });
}(createPointAt(true));

/******************************************************************************
 * Module : es6.regexp                                                        *
 ******************************************************************************/

!function(RegExpProto, _RegExp){
  function assertRegExpWrapper(fn){
    return function(){
      assert(cof(this) === REGEXP);
      return fn(this);
    }
  }
  
  // RegExp allows a regex with flags as the pattern
  if(DESC && !function(){try{return RegExp(/a/g, 'i') == '/a/i'}catch(e){}}()){
    RegExp = function RegExp(pattern, flags){
      return new _RegExp(cof(pattern) == REGEXP && flags !== undefined
        ? pattern.source : pattern, flags);
    }
    forEach.call(getNames(_RegExp), function(key){
      key in RegExp || defineProperty(RegExp, key, {
        configurable: true,
        get: function(){ return _RegExp[key] },
        set: function(it){ _RegExp[key] = it }
      });
    });
    RegExpProto[CONSTRUCTOR] = RegExp;
    RegExp[PROTOTYPE] = RegExpProto;
    hidden(global, REGEXP, RegExp);
  }
  
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')defineProperty(RegExpProto, 'flags', {
    configurable: true,
    get: assertRegExpWrapper(createReplacer(/^.*\/(\w*)$/, '$1', true))
  });
  
  // 21.2.5.12 get RegExp.prototype.sticky()
  // 21.2.5.15 get RegExp.prototype.unicode()
  forEach.call(array('sticky,unicode'), function(key){
    key in /./ || defineProperty(RegExpProto, key, DESC ? {
      configurable: true,
      get: assertRegExpWrapper(function(){
        return false;
      })
    } : descriptor(5, false));
  });
  
  setSpecies(RegExp);
}(RegExp[PROTOTYPE], RegExp);

/******************************************************************************
 * Module : web.immediate                                                     *
 ******************************************************************************/

// setImmediate shim
// Node.js 0.9+ & IE10+ has setImmediate, else:
isFunction(setImmediate) && isFunction(clearImmediate) || function(ONREADYSTATECHANGE){
  var postMessage      = global.postMessage
    , addEventListener = global.addEventListener
    , MessageChannel   = global.MessageChannel
    , counter          = 0
    , queue            = {}
    , defer, channel, port;
  setImmediate = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    }
    defer(counter);
    return counter;
  }
  clearImmediate = function(id){
    delete queue[id];
  }
  function run(id){
    if(has(queue, id)){
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  }
  function listner(event){
    run(event.data);
  }
  // Node.js 0.8-
  if(NODE){
    defer = function(id){
      nextTick(part.call(run, id));
    }
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    }
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(document && ONREADYSTATECHANGE in document[CREATE_ELEMENT]('script')){
    defer = function(id){
      html.appendChild(document[CREATE_ELEMENT]('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run(id);
      }
    }
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(run, 0, id);
    }
  }
}('onreadystatechange');
$define(GLOBAL + BIND, {
  setImmediate:   setImmediate,
  clearImmediate: clearImmediate
});

/******************************************************************************
 * Module : es6.promise                                                       *
 ******************************************************************************/

// ES6 promises shim
// Based on https://github.com/getify/native-promise-only/
!function(Promise, test){
  isFunction(Promise) && isFunction(Promise.resolve)
  && Promise.resolve(test = new Promise(function(){})) == test
  || function(asap, DEF){
    function isThenable(o){
      var then;
      if(isObject(o))then = o.then;
      return isFunction(then) ? then : false;
    }
    function notify(def){
      var chain = def.chain;
      chain.length && asap(function(){
        var msg = def.msg
          , ok  = def.state == 1
          , i   = 0;
        while(chain.length > i)!function(react){
          var cb = ok ? react.ok : react.fail
            , ret, then;
          try {
            if(cb){
              ret = cb === true ? msg : cb(msg);
              if(ret === react.P){
                react.rej(TypeError(PROMISE + '-chain cycle'));
              } else if(then = isThenable(ret)){
                then.call(ret, react.res, react.rej);
              } else react.res(ret);
            } else react.rej(msg);
          } catch(err){
            react.rej(err);
          }
        }(chain[i++]);
        chain.length = 0;
      });
    }
    function resolve(msg){
      var def = this
        , then, wrapper;
      if(def.done)return;
      def.done = true;
      def = def.def || def; // unwrap
      try {
        if(then = isThenable(msg)){
          wrapper = {def: def, done: false}; // wrap
          then.call(msg, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
        } else {
          def.msg = msg;
          def.state = 1;
          notify(def);
        }
      } catch(err){
        reject.call(wrapper || {def: def, done: false}, err); // wrap
      }
    }
    function reject(msg){
      var def = this;
      if(def.done)return;
      def.done = true;
      def = def.def || def; // unwrap
      def.msg = msg;
      def.state = 2;
      notify(def);
    }
    function getConstructor(C){
      var S = assertObject(C)[SYMBOL_SPECIES];
      return S != undefined ? S : C;
    }
    // 25.4.3.1 Promise(executor)
    Promise = function(executor){
      assertFunction(executor);
      assertInstance(this, Promise, PROMISE);
      var def = {chain: [], state: 0, done: false, msg: undefined};
      hidden(this, DEF, def);
      try {
        executor(ctx(resolve, def, 1), ctx(reject, def, 1));
      } catch(err){
        reject.call(def, err);
      }
    }
    assignHidden(Promise[PROTOTYPE], {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function(onFulfilled, onRejected){
        var S = assertObject(assertObject(this)[CONSTRUCTOR])[SYMBOL_SPECIES];
        var react = {
          ok:   isFunction(onFulfilled) ? onFulfilled : true,
          fail: isFunction(onRejected)  ? onRejected  : false
        } , P = react.P = new (S != undefined ? S : Promise)(function(resolve, reject){
          react.res = assertFunction(resolve);
          react.rej = assertFunction(reject);
        }), def = this[DEF];
        def.chain.push(react);
        def.state && notify(def);
        return P;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function(onRejected){
        return this.then(undefined, onRejected);
      }
    });
    assignHidden(Promise, {
      // 25.4.4.1 Promise.all(iterable)
      all: function(iterable){
        var Promise = getConstructor(this)
          , values  = [];
        return new Promise(function(resolve, reject){
          forOf(iterable, false, push, values);
          var remaining = values.length
            , results   = Array(remaining);
          if(remaining)forEach.call(values, function(promise, index){
            Promise.resolve(promise).then(function(value){
              results[index] = value;
              --remaining || resolve(results);
            }, reject);
          });
          else resolve(results);
        });
      },
      // 25.4.4.4 Promise.race(iterable)
      race: function(iterable){
        var Promise = getConstructor(this);
        return new Promise(function(resolve, reject){
          forOf(iterable, false, function(promise){
            Promise.resolve(promise).then(resolve, reject);
          });
        });
      },
      // 25.4.4.5 Promise.reject(r)
      reject: function(r){
        return new (getConstructor(this))(function(resolve, reject){
          reject(r);
        });
      },
      // 25.4.4.6 Promise.resolve(x)
      resolve: function(x){
        return isObject(x) && DEF in x && getPrototypeOf(x) === this[PROTOTYPE]
          ? x : new (getConstructor(this))(function(resolve, reject){
            resolve(x);
          });
      }
    });
  }(nextTick || setImmediate, safeSymbol('def'));
  setToStringTag(Promise, PROMISE);
  setSpecies(Promise);
  $define(GLOBAL + FORCED * !isNative(Promise), {Promise: Promise});
}(global[PROMISE]);

/******************************************************************************
 * Module : es6.collections                                                   *
 ******************************************************************************/

// ECMAScript 6 collections shim
!function(){
  var UID   = safeSymbol('uid')
    , O1    = safeSymbol('O1')
    , WEAK  = safeSymbol('weak')
    , LEAK  = safeSymbol('leak')
    , LAST  = safeSymbol('last')
    , FIRST = safeSymbol('first')
    , SIZE  = DESC ? safeSymbol('size') : 'size'
    , uid   = 0
    , tmp   = {};
  
  function getCollection(C, NAME, methods, commonMethods, isMap, isWeak){
    var ADDER = isMap ? 'set' : 'add'
      , proto = C && C[PROTOTYPE]
      , O     = {};
    function initFromIterable(that, iterable){
      if(iterable != undefined)forOf(iterable, isMap, that[ADDER], that);
      return that;
    }
    function fixSVZ(key, chain){
      var method = proto[key];
      if(framework)proto[key] = function(a, b){
        var result = method.call(this, a === 0 ? 0 : a, b);
        return chain ? this : result;
      };
    }
    if(!isNative(C) || !(isWeak || (!BUGGY_ITERATORS && has(proto, FOR_EACH) && has(proto, 'entries')))){
      // create collection constructor
      C = isWeak
        ? function(iterable){
            assertInstance(this, C, NAME);
            set(this, UID, uid++);
            initFromIterable(this, iterable);
          }
        : function(iterable){
            var that = this;
            assertInstance(that, C, NAME);
            set(that, O1, create(null));
            set(that, SIZE, 0);
            set(that, LAST, undefined);
            set(that, FIRST, undefined);
            initFromIterable(that, iterable);
          };
      assignHidden(assignHidden(C[PROTOTYPE], methods), commonMethods);
      isWeak || defineProperty(C[PROTOTYPE], 'size', {get: function(){
        return assertDefined(this[SIZE]);
      }});
    } else {
      var Native = C
        , inst   = new C
        , chain  = inst[ADDER](isWeak ? {} : -0, 1)
        , buggyZero;
      // wrap to init collections from iterable
      if(!NATIVE_ITERATORS || !C.length){
        C = function(iterable){
          assertInstance(this, C, NAME);
          return initFromIterable(new Native, iterable);
        }
        C[PROTOTYPE] = proto;
        if(framework)proto[CONSTRUCTOR] = C;
      }
      isWeak || inst[FOR_EACH](function(val, key){
        buggyZero = 1 / key === -Infinity;
      });
      // fix converting -0 key to +0
      if(buggyZero){
        fixSVZ('delete');
        fixSVZ('has');
        isMap && fixSVZ('get');
      }
      // + fix .add & .set for chaining
      if(buggyZero || chain !== inst)fixSVZ(ADDER, true);
    }
    setToStringTag(C, NAME);
    setSpecies(C);
    
    O[NAME] = C;
    $define(GLOBAL + WRAP + FORCED * !isNative(C), O);
    
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    isWeak || defineStdIterators(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return iterResult(1);
      }
      // return step by kind
      if(kind == KEY)  return iterResult(0, entry.k);
      if(kind == VALUE)return iterResult(0, entry.v);
                       return iterResult(0, [entry.k, entry.v]);   
    }, isMap ? KEY+VALUE : VALUE, !isMap);
    
    return C;
  }
  
  function fastKey(it, create){
    // return primitive with prefix
    if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
    // can't set id to frozen object
    if(isFrozen(it))return 'F';
    if(!has(it, UID)){
      // not necessary to add id
      if(!create)return 'E';
      // add missing object id
      hidden(it, UID, ++uid);
    // return object id with prefix
    } return 'O' + it[UID];
  }
  function getEntry(that, key){
    // fast case
    var index = fastKey(key), entry;
    if(index != 'F')return that[O1][index];
    // frozen object case
    for(entry = that[FIRST]; entry; entry = entry.n){
      if(entry.k == key)return entry;
    }
  }
  function def(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry)entry.v = value;
    // create new entry
    else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  }

  var collectionMethods = {
    // 23.1.3.1 Map.prototype.clear()
    // 23.2.3.2 Set.prototype.clear()
    clear: function(){
      for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
        entry.r = true;
        if(entry.p)entry.p = entry.p.n = undefined;
        delete data[entry.i];
      }
      that[FIRST] = that[LAST] = undefined;
      that[SIZE] = 0;
    },
    // 23.1.3.3 Map.prototype.delete(key)
    // 23.2.3.4 Set.prototype.delete(value)
    'delete': function(key){
      var that  = this
        , entry = getEntry(that, key);
      if(entry){
        var next = entry.n
          , prev = entry.p;
        delete that[O1][entry.i];
        entry.r = true;
        if(prev)prev.n = next;
        if(next)next.p = prev;
        if(that[FIRST] == entry)that[FIRST] = next;
        if(that[LAST] == entry)that[LAST] = prev;
        that[SIZE]--;
      } return !!entry;
    },
    // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
    // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
    forEach: function(callbackfn /*, that = undefined */){
      var f = ctx(callbackfn, arguments[1], 3)
        , entry;
      while(entry = entry ? entry.n : this[FIRST]){
        f(entry.v, entry.k, this);
        // revert to the last existing entry
        while(entry && entry.r)entry = entry.p;
      }
    },
    // 23.1.3.7 Map.prototype.has(key)
    // 23.2.3.7 Set.prototype.has(value)
    has: function(key){
      return !!getEntry(this, key);
    }
  }
  
  // 23.1 Map Objects
  Map = getCollection(Map, MAP, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function(key){
      var entry = getEntry(this, key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function(key, value){
      return def(this, key === 0 ? 0 : key, value);
    }
  }, collectionMethods, true);
  
  // 23.2 Set Objects
  Set = getCollection(Set, SET, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function(value){
      return def(this, value = value === 0 ? 0 : value, value);
    }
  }, collectionMethods);
  
  function defWeak(that, key, value){
    if(isFrozen(assertObject(key)))leakStore(that).set(key, value);
    else {
      has(key, WEAK) || hidden(key, WEAK, {});
      key[WEAK][that[UID]] = value;
    } return that;
  }
  function leakStore(that){
    return that[LEAK] || hidden(that, LEAK, new Map)[LEAK];
  }
  
  var weakMethods = {
    // 23.3.3.2 WeakMap.prototype.delete(key)
    // 23.4.3.3 WeakSet.prototype.delete(value)
    'delete': function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this)['delete'](key);
      return has(key, WEAK) && has(key[WEAK], this[UID]) && delete key[WEAK][this[UID]];
    },
    // 23.3.3.4 WeakMap.prototype.has(key)
    // 23.4.3.4 WeakSet.prototype.has(value)
    has: function(key){
      if(!isObject(key))return false;
      if(isFrozen(key))return leakStore(this).has(key);
      return has(key, WEAK) && has(key[WEAK], this[UID]);
    }
  };
  
  // 23.3 WeakMap Objects
  WeakMap = getCollection(WeakMap, WEAKMAP, {
    // 23.3.3.3 WeakMap.prototype.get(key)
    get: function(key){
      if(isObject(key)){
        if(isFrozen(key))return leakStore(this).get(key);
        if(has(key, WEAK))return key[WEAK][this[UID]];
      }
    },
    // 23.3.3.5 WeakMap.prototype.set(key, value)
    set: function(key, value){
      return defWeak(this, key, value);
    }
  }, weakMethods, true, true);
  
  // IE11 WeakMap frozen keys fix
  if(framework && new WeakMap().set(Object.freeze(tmp), 7).get(tmp) != 7){
    forEach.call(array('delete,has,get,set'), function(key){
      var method = WeakMap[PROTOTYPE][key];
      WeakMap[PROTOTYPE][key] = function(a, b){
        // store frozen objects on leaky map
        if(isObject(a) && isFrozen(a)){
          var result = leakStore(this)[key](a, b);
          return key == 'set' ? this : result;
        // store all the rest on native weakmap
        } return method.call(this, a, b);
      };
    });
  }
  
  // 23.4 WeakSet Objects
  WeakSet = getCollection(WeakSet, WEAKSET, {
    // 23.4.3.1 WeakSet.prototype.add(value)
    add: function(value){
      return defWeak(this, value, true);
    }
  }, weakMethods, false, true);
}();

/******************************************************************************
 * Module : es6.reflect                                                       *
 ******************************************************************************/

!function(){
  function Enumerate(iterated){
    var keys = [], key;
    for(key in iterated)keys.push(key);
    set(this, ITER, {o: iterated, a: keys, i: 0});
  }
  createIterator(Enumerate, OBJECT, function(){
    var iter = this[ITER]
      , keys = iter.a
      , key;
    do {
      if(iter.i >= keys.length)return iterResult(1);
    } while(!((key = keys[iter.i++]) in iter.o));
    return iterResult(0, key);
  });
  
  function wrap(fn){
    return function(it){
      assertObject(it);
      try {
        return fn.apply(undefined, arguments), true;
      } catch(e){
        return false;
      }
    }
  }
  
  function reflectGet(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = getOwnDescriptor(assertObject(target), propertyKey), proto;
    if(desc)return has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getPrototypeOf(target))
      ? reflectGet(proto, propertyKey, receiver)
      : undefined;
  }
  function reflectSet(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = getOwnDescriptor(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getPrototypeOf(target))){
        return reflectSet(proto, propertyKey, V, receiver);
      }
      ownDesc = descriptor(0);
    }
    if(has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = getOwnDescriptor(receiver, propertyKey) || descriptor(0);
      existingDescriptor.value = V;
      return defineProperty(receiver, propertyKey, existingDescriptor), true;
    }
    return ownDesc.set === undefined
      ? false
      : (ownDesc.set.call(receiver, V), true);
  }
  var isExtensible = Object.isExtensible || returnIt;
  
  var reflect = {
    // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
    apply: ctx(call, apply, 3),
    // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
    construct: construct,
    // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
    defineProperty: wrap(defineProperty),
    // 26.1.4 Reflect.deleteProperty(target, propertyKey)
    deleteProperty: function(target, propertyKey){
      var desc = getOwnDescriptor(assertObject(target), propertyKey);
      return desc && !desc.configurable ? false : delete target[propertyKey];
    },
    // 26.1.5 Reflect.enumerate(target)
    enumerate: function(target){
      return new Enumerate(assertObject(target));
    },
    // 26.1.6 Reflect.get(target, propertyKey [, receiver])
    get: reflectGet,
    // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    getOwnPropertyDescriptor: function(target, propertyKey){
      return getOwnDescriptor(assertObject(target), propertyKey);
    },
    // 26.1.8 Reflect.getPrototypeOf(target)
    getPrototypeOf: function(target){
      return getPrototypeOf(assertObject(target));
    },
    // 26.1.9 Reflect.has(target, propertyKey)
    has: function(target, propertyKey){
      return propertyKey in target;
    },
    // 26.1.10 Reflect.isExtensible(target)
    isExtensible: function(target){
      return !!isExtensible(assertObject(target));
    },
    // 26.1.11 Reflect.ownKeys(target)
    ownKeys: ownKeys,
    // 26.1.12 Reflect.preventExtensions(target)
    preventExtensions: wrap(Object.preventExtensions || returnIt),
    // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
    set: reflectSet
  }
  // 26.1.14 Reflect.setPrototypeOf(target, proto)
  if(setPrototypeOf)reflect.setPrototypeOf = function(target, proto){
    return setPrototypeOf(assertObject(target), proto), true;
  };
  
  $define(GLOBAL, {Reflect: {}});
  $define(STATIC, 'Reflect', reflect);
}();

/******************************************************************************
 * Module : es7.proposals                                                     *
 ******************************************************************************/

!function(){
  $define(PROTO, ARRAY, {
    // https://github.com/domenic/Array.prototype.includes
    includes: createArrayContains(true)
  });
  $define(PROTO, STRING, {
    // https://github.com/mathiasbynens/String.prototype.at
    at: createPointAt(true)
  });
  
  function createObjectToArray(isEntries){
    return function(object){
      var O      = toObject(object)
        , keys   = getKeys(object)
        , length = keys.length
        , i      = 0
        , result = Array(length)
        , key;
      if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
      else while(length > i)result[i] = O[keys[i++]];
      return result;
    }
  }
  $define(STATIC, OBJECT, {
    // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-04/apr-9.md#51-objectentries-objectvalues
    values: createObjectToArray(false),
    entries: createObjectToArray(true)
  });
  $define(STATIC, REGEXP, {
    // https://gist.github.com/kangax/9698100
    escape: createReplacer(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
  });
}();

/******************************************************************************
 * Module : es7.abstract-refs                                                 *
 ******************************************************************************/

// https://github.com/zenparsing/es-abstract-refs
!function(REFERENCE){
  REFERENCE_GET = getWellKnownSymbol(REFERENCE+'Get', true);
  var REFERENCE_SET = getWellKnownSymbol(REFERENCE+SET, true)
    , REFERENCE_DELETE = getWellKnownSymbol(REFERENCE+'Delete', true);
  
  $define(STATIC, SYMBOL, {
    referenceGet: REFERENCE_GET,
    referenceSet: REFERENCE_SET,
    referenceDelete: REFERENCE_DELETE
  });
  
  hidden(FunctionProto, REFERENCE_GET, returnThis);
  
  function setMapMethods(Constructor){
    if(Constructor){
      var MapProto = Constructor[PROTOTYPE];
      hidden(MapProto, REFERENCE_GET, MapProto.get);
      hidden(MapProto, REFERENCE_SET, MapProto.set);
      hidden(MapProto, REFERENCE_DELETE, MapProto['delete']);
    }
  }
  setMapMethods(Map);
  setMapMethods(WeakMap);
}('reference');

/******************************************************************************
 * Module : js.array.statics                                                  *
 ******************************************************************************/

// JavaScript 1.6 / Strawman array statics shim
!function(arrayStatics){
  function setArrayStatics(keys, length){
    forEach.call(array(keys), function(key){
      if(key in ArrayProto)arrayStatics[key] = ctx(call, ArrayProto[key], length);
    });
  }
  setArrayStatics('pop,reverse,shift,keys,values,entries', 1);
  setArrayStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
  setArrayStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
                  'reduce,reduceRight,copyWithin,fill,turn');
  $define(STATIC, ARRAY, arrayStatics);
}({});

/******************************************************************************
 * Module : web.dom.itarable                                                  *
 ******************************************************************************/

!function(NodeList){
  if(framework && NodeList && !(SYMBOL_ITERATOR in NodeList[PROTOTYPE])){
    hidden(NodeList[PROTOTYPE], SYMBOL_ITERATOR, Iterators[ARRAY]);
  }
  Iterators.NodeList = Iterators[ARRAY];
}(global.NodeList);
}(typeof self != 'undefined' && self.Math === Math ? self : Function('return this')(), true);
},{}],3:[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryLocsList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryLocsList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    _findFinallyEntry: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") && (
              entry.finallyLoc === finallyLoc ||
              this.prev < entry.finallyLoc)) {
          return entry;
        }
      }
    },

    abrupt: function(type, arg) {
      var entry = this._findFinallyEntry();
      var record = entry ? entry.completion : {};

      record.type = type;
      record.arg = arg;

      if (entry) {
        this.next = entry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      var entry = this._findFinallyEntry(finallyLoc);
      return this.complete(entry.completion, entry.afterLoc);
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Location = _interopRequire(require("./location"));

module.exports = new Location(location.pathname + location.search);

},{"./location":7}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/*
  super simplified hook system
  to create a hook:

      import hooks from '../../jsx/hooks';
      hooks.call()
 */

var _events = {};

var Hook = (function () {
  function Hook() {
    _classCallCheck(this, Hook);

    this.handlers = new Set();
  }

  _prototypeProperties(Hook, null, {
    on: {
      value: function on(handler) {
        return this.handlers.add(handler);
      },
      writable: true,
      configurable: true
    },
    off: {
      value: function off(handler) {
        return this.handlers["delete"](handler);
      },
      writable: true,
      configurable: true
    },
    call: {
      value: function call() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        for (var _iterator = this.handlers[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
          var handler = _step.value;

          handler.apply(null, args);
        }
      },
      writable: true,
      configurable: true
    }
  });

  return Hook;
})();

module.exports = {
  get: function (name) {
    return _events[name] || (_events[name] = new Hook());
  } };

},{}],7:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var protocolPattern = /^(https?:)/;
var hostPattern = /([a-zA-Z0-9_\-\.]{3,}\.[a-zA-Z]{2,3})/;

var Location = (function () {
  function Location(url) {
    _classCallCheck(this, Location);

    var protocolMatch = url.match(protocolPattern);
    var protocol;

    var queryParts = url.split("?");
    var query = {};

    if (queryParts.length > 1) {
      url = queryParts[0];

      queryParts.slice(1).join("?").split("&").forEach(function (pair) {
        var parts = pair.split("=");
        var key = parts[0];
        var val = true;

        if (parts.length === 2) {
          val = parts[1];
        }

        query[key] = val;
      });
    }

    if (protocolMatch) {
      protocol = protocolMatch[0];
      url = url.replace(protocol, "");
    } else {
      protocol = location.protocol;
    }

    var hostMatch = url.match(hostPattern);
    var host;

    if (hostMatch) {
      host = hostMatch[0];
      url = url.replace(host, "");
    } else {
      host = location.host;
    }

    var parts = url.replace(/\//g, " ").trim().split(" ");
    var subreddit = parts[0] === "r" ? parts[1] : null;
    var pageID = subreddit ? 2 : 0;
    var page = parts[pageID] || null;
    var thing = page ? parts[pageID + 1] : null;
    var pathname = "/" + parts.join("/");

    this.parts = parts;
    this.pathname = pathname;
    this.subreddit = subreddit;
    this.page = page;
    this.thing = thing;
    this.protocol = protocol;
    this.host = host;
    this.query = query;
  }

  _prototypeProperties(Location, {
    parseURL: {
      value: function parseURL(url) {
        return new Location(url);
      },
      writable: true,
      configurable: true
    }
  });

  return Location;
})();

module.exports = Location;

},{}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

require("babel/polyfill");

var getPluginsList = require("./plugins").getPluginsList;

var store = _interopRequire(require("./store"));

var toCssClassName = require("./utils").toCssClassName;

var plugins = getPluginsList();

// purge old settings, save new
store.state = {};
plugins.forEach(function (plugin) {
  plugin.setup();
  store.set(plugin.name, plugin.state);
});
var activePlugins = plugins.filter(function (plugin) {
  return plugin.shouldRun();
});
var pluginClassNames = activePlugins.map(function (plugin) {
  if (plugin.meta.cssClassName) {
    return "gnome-" + plugin.meta.cssClassName;
  } else {
    var pluginBaseName = plugin.name.replace("Plugin", "");
    return "gnome-" + toCssClassName(pluginBaseName);
  }
});

$(function () {
  $("html").addClass(pluginClassNames.join(" "));
  activePlugins.forEach(function (plugin) {
    return plugin.run();
  });
});

},{"./plugins":11,"./store":13,"./utils":14,"babel/polyfill":4}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

/* do not edit this file
   this file generated from the grunt buildplugins task */

var plugins = [];

var juicyvotes = _interopRequire(require("../plugins/juicy-votes/plugin"));

plugins.push(juicyvotes);

var livecomments = _interopRequire(require("../plugins/live-comments/plugin"));

plugins.push(livecomments);

var prefs = _interopRequire(require("../plugins/prefs/plugin"));

plugins.push(prefs);

var readnext = _interopRequire(require("../plugins/readnext/plugin"));

plugins.push(readnext);

var subredditsearch = _interopRequire(require("../plugins/subreddit-search/plugin"));

plugins.push(subredditsearch);

var test = _interopRequire(require("../plugins/test/plugin"));

plugins.push(test);

var topcomment = _interopRequire(require("../plugins/top-comment/plugin"));

plugins.push(topcomment);

module.exports = plugins;

},{"../plugins/juicy-votes/plugin":15,"../plugins/live-comments/plugin":17,"../plugins/prefs/plugin":18,"../plugins/readnext/plugin":20,"../plugins/subreddit-search/plugin":22,"../plugins/test/plugin":23,"../plugins/top-comment/plugin":24}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var store = _interopRequire(require("./store"));

var StoreModel = _interopRequire(require("./store-model"));

var Plugin = (function (StoreModel) {
  function Plugin() {
    _classCallCheck(this, Plugin);

    var _ref = this;

    var name = _ref.name;

    var initialState = store.state[name];

    var defaultState = {};
    var nextConstructor = this.constructor;
    var nextDefaultState = nextConstructor.defaultState;

    while (nextDefaultState) {
      Object.assign(defaultState, nextDefaultState);
      nextConstructor = nextConstructor.prototype.__proto__.constructor;
      nextDefaultState = nextConstructor.defaultState;
    }

    Object.assign(defaultState, initialState);
    this.state = defaultState;
  }

  _inherits(Plugin, StoreModel);

  _prototypeProperties(Plugin, {
    defaultState: {
      get: function () {
        return {
          enabled: true };
      },
      configurable: true
    }
  }, {
    name: {
      get: function () {
        return this.constructor.name;
      },
      configurable: true
    },
    meta: {
      get: function () {
        return this.constructor.meta || {};
      },
      configurable: true
    },
    shouldRun: {

      // in subclass methods call `return foo & super.shouldRun();` in subclass methods

      value: function shouldRun() {
        return this.state.enabled;
      },
      writable: true,
      configurable: true
    },
    _commit: {
      value: function _commit() {
        store[this.name] = this.state;
        store._commit();
      },
      writable: true,
      configurable: true
    },
    setup: {
      value: function setup() {},
      writable: true,
      configurable: true
    },
    run: {
      value: function run() {},
      writable: true,
      configurable: true
    }
  });

  return Plugin;
})(StoreModel);

module.exports = Plugin;

},{"./store":13,"./store-model":12}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.getPluginsList = getPluginsList;
exports.getPlugins = getPlugins;

var pluginClasses = _interopRequire(require("./plugin-loader"));

var plugins = {
  map: {},
  list: [] };

pluginClasses.forEach(function (GnomePlugin) {
  if (GnomePlugin instanceof Function) {
    var displayName = GnomePlugin.displayName;

    var plugin = new GnomePlugin();

    plugins.map[displayName] = plugin;
    plugins.list.push(plugin);
  } else {
    throw "plugin must be a function";
  }
});

function getPluginsList() {
  return plugins.list;
};

function getPlugins() {
  return plugins.map;
};
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{"./plugin-loader":9}],12:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

/**
 * a little localstorage wrapper that we'll use to store plugin state.  saves
 * a plain javascript object to localStorage under the given key (reddit-gnomes)
 * as a JSON string.  As long as the setState and set methods are used, you
 * don't have to worry about manually committing the changes.  Maybe not the
 * most efficient, but hey, it doesn't have to be :)
 */

var StoreModel = (function () {
  function StoreModel(key) {
    _classCallCheck(this, StoreModel);

    this.key = key;

    if (localStorage[key]) {
      this.state = JSON.parse(localStorage[key]);
    } else {
      this.state = {};
    }
  }

  _prototypeProperties(StoreModel, null, {
    setState: {
      value: function setState(newState) {
        var willChange = false;

        for (var key in newState) {
          if (typeof newState[key] === "object" || this.state[key] !== newState[key] && !willChange) {
            willChange = true;
          }

          this.state[key] = newState[key];
        }

        if (willChange) {
          this._commit();
        }
      },
      writable: true,
      configurable: true
    },
    set: {
      value: function set(key, val) {
        var parts = key.split("/");
        var target = this.state;
        var l = parts.length - 1;
        for (var i = 0; i < l; i++) {
          if (target && target instanceof Object) {
            target = target[parts[i]];
          } else {
            throw "invalid path, " + parts[i] + " is not an object!";
          }
        }

        key = parts[l];

        if (target[key] !== val) {
          target[key] = val;
          this._commit();
        }
      },
      writable: true,
      configurable: true
    },
    _commit: {
      value: function _commit() {
        localStorage[this.key] = JSON.stringify(this.state);
      },
      writable: true,
      configurable: true
    },
    keys: {
      value: function keys() {
        return Object.keys(this.state);
      },
      writable: true,
      configurable: true
    }
  });

  return StoreModel;
})();

module.exports = StoreModel;

},{}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var StoreModel = _interopRequire(require("./store-model"));

module.exports = new StoreModel("reddit-gnomes");

},{"./store-model":12}],14:[function(require,module,exports){
"use strict";

exports.unsafe = unsafe;
exports.toCssClassName = toCssClassName;

var unsafeDiv = document.createElement("div");

function unsafe(text) {
  unsafeDiv.innerHTML = text;
  return unsafeDiv.innerText;
}

var camelCaseRegex = /([a-z])([A-Z])/g;
var whitespaceRegex = /\ +/g;

function hyphenate(match, $1, $2) {
  return $1 + "-" + $2;
}

function toCssClassName(name) {
  return name.replace(whitespaceRegex, "-").replace(camelCaseRegex, hyphenate).toLowerCase();
}
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Plugin = _interopRequire(require("../../jsx/plugin"));

var JuicyVotesPlugin = (function (Plugin) {
  function JuicyVotesPlugin() {
    _classCallCheck(this, JuicyVotesPlugin);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(JuicyVotesPlugin, Plugin);

  _prototypeProperties(JuicyVotesPlugin, null, {
    run: {
      value: function run() {
        $(".arrow").on("click", function () {
          var $this = $(this);

          if ($this.hasClass("upmod") || $this.hasClass("downmod")) {
            $this.addClass("reddit-prototype-juicy-ui-pulse");
          } else if ($this.hasClass("up") || $this.hasClass("down")) {
            $this.removeClass("reddit-prototype-juicy-ui-pulse");
          }
        });
      },
      writable: true,
      configurable: true
    }
  });

  return JuicyVotesPlugin;
})(Plugin);

module.exports = JuicyVotesPlugin;

JuicyVotesPlugin.meta = {
  displayName: "Juicy Gnome Votes",
  description: "adds juicy animations to vote arrows. that's right. juicy.",
  cssClassName: "juicy-votes" };

},{"../../jsx/plugin":10}],16:[function(require,module,exports){
"use strict";

module.exports = React.createClass({
  displayName: "comment",

  render: function render() {
    return React.createElement(
      "li",
      { className: "liveupdate" },
      React.createElement(
        "a",
        { href: "#" },
        React.createElement(
          "time",
          { className: "live-timestamp" },
          "some time ago"
        )
      ),
      React.createElement(
        "div",
        { className: "body reddit-prototype-live-comment" },
        React.createElement(
          "header",
          null,
          "by ",
          React.createElement(
            "a",
            { className: "reddit-prototype-live-comment-author" },
            "/u/" + this.props.author
          ),
          "  from discussion in",
          React.createElement(
            "a",
            { className: "reddit-prototype-live-comment-subreddit",
              href: this.props.discussionLink },
            "/r/" + this.props.subreddit
          ),
          " | ",
          React.createElement(
            "span",
            { className: "reddit-prototype-live-comment-score" },
            this.props.score + " points"
          )
        ),
        React.createElement("div", { className: "md-container",
          dangerouslySetInnerHTML: { __html: context.unsafe(this.props.body_html) } })
      )
    );
  }
});

},{}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Plugin = _interopRequire(require("../../jsx/plugin"));

var Location = _interopRequire(require("../../jsx/location"));

var Comment = _interopRequire(require("./comment"));

var LiveCommentsPlugin = (function (Plugin) {
  function LiveCommentsPlugin() {
    _classCallCheck(this, LiveCommentsPlugin);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(LiveCommentsPlugin, Plugin);

  _prototypeProperties(LiveCommentsPlugin, null, {
    run: {
      value: function run() {
        $(function () {
          var $discussionLinks = $("#discussions > div > p > a");

          if (!$discussionLinks.length) {
            return;
          }

          var topDiscussionLink = $discussionLinks[0];

          var path = Location.parseURL(topDiscussionLink.href).pathname + ".json?sort=new";

          $.get(path).then(function (res) {
            if (!res || res.length !== 2) {
              return;
            }

            var comments = res[1].data.children.map(function (child) {
              return child.data;
            });
            var $liveUpdates = $(".liveupdate-listing .liveupdate");

            var i = 0;
            var j = 0;

            var getCommentTime = function (comment) {
              return comment.created_utc * 1000;
            };
            var getLiveUpdateTime = function (liveUpdate) {
              return new Date($(liveUpdate).find("time")[0].getAttribute("datetime")).getTime();
            };

            var commentTime = getCommentTime(comments[i]);
            var liveUpdateTime = getLiveUpdateTime($liveUpdates[j]);

            while (true) {
              if (commentTime >= liveUpdateTime) {
                // if the comment is newer than the liveUpdate
                // insert above and check the next comment
                $liveUpdates.eq(j).before($.parseHTML(React.renderToStaticMarkup(React.createElement(Comment, _extends({}, comments[i], { discussionLink: topDiscussionLink.href })))));
                i++;
                if (i < comments.length) {
                  commentTime = getCommentTime(comments[i]);
                } else {
                  break;
                }
              } else {
                // otherwise, do nothing and check the next liveupdate
                j++;
                if (j < $liveUpdates.length) {
                  liveUpdateTime = getLiveUpdateTime($liveUpdates[j]);
                } else {
                  break;
                }
              }
            };
          });
        });
      },
      writable: true,
      configurable: true
    }
  });

  return LiveCommentsPlugin;
})(Plugin);

module.exports = LiveCommentsPlugin;

LiveCommentsPlugin.meta = {
  displayName: "Live Comment Gnomes",
  description: "pulls comments into reddit live threads from related discussions",
  cssClassName: "live-comments" };

},{"../../jsx/location":7,"../../jsx/plugin":10,"./comment":16}],18:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Plugin = _interopRequire(require("../../jsx/plugin"));

var context = _interopRequire(require("../../jsx/context"));

var getPluginsList = require("../../jsx/plugins").getPluginsList;

var hooks = _interopRequire(require("../../jsx/hooks"));

var _views = require("./views");

var GnomePrefs = _views.GnomePrefs;
var preftableTemplate = _views.preftableTemplate;

var PrefsPlugin = (function (Plugin) {
  function PrefsPlugin() {
    _classCallCheck(this, PrefsPlugin);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(PrefsPlugin, Plugin);

  _prototypeProperties(PrefsPlugin, null, {
    shouldRun: {
      value: function shouldRun() {
        return context.page === "prefs";
      },
      writable: true,
      configurable: true
    },
    run: {
      value: function run() {
        var prefTable = $.parseHTML(preftableTemplate);
        var mountNode = document.createElement("div");
        var plugins = getPluginsList();
        var descriptor = this.buildDescriptor(plugins);;

        hooks.get("init-prefs").call(descriptor);

        $(prefTable).find(".prefright").append(mountNode);
        $(".content form").eq(0).after(prefTable);
        React.render(React.createElement(GnomePrefs, { plugins: plugins,
          descriptor: descriptor }), mountNode);
      },
      writable: true,
      configurable: true
    },
    buildDescriptor: {
      value: function buildDescriptor(plugins) {
        var descriptor = {};

        plugins.forEach(function (plugin) {
          var _plugin$meta = plugin.meta;
          var displayName = _plugin$meta.displayName;
          var description = _plugin$meta.description;

          descriptor[plugin.name] = [{
            property: "enabled",
            displayName: displayName,
            description: description }];
        });

        return descriptor;
      },
      writable: true,
      configurable: true
    }
  });

  return PrefsPlugin;
})(Plugin);

module.exports = PrefsPlugin;

PrefsPlugin.meta = {
  displayName: "Gnome Preferences",
  description: "creates UI on the user preference page to enable and \ndisable plugins" };

},{"../../jsx/context":5,"../../jsx/hooks":6,"../../jsx/plugin":10,"../../jsx/plugins":11,"./views":19}],19:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var toCssClassName = require("../../jsx/utils").toCssClassName;

var GnomePrefInput = (function (_React$Component) {
  function GnomePrefInput(props) {
    _classCallCheck(this, GnomePrefInput);

    _get(Object.getPrototypeOf(GnomePrefInput.prototype), "constructor", this).call(this, props);
    var val = this.props.plugin.state[this.props.property] || false;
    this.state = { val: val };

    this.handleClick = this.handleClick.bind(this);
  }

  _inherits(GnomePrefInput, _React$Component);

  _prototypeProperties(GnomePrefInput, null, {
    render: {
      value: function render() {
        var _props = this.props;
        var name = _props.name;
        var description = _props.description;

        var cssName = toCssClassName(name);

        return React.createElement(
          "div",
          { className: "gnome-pref gnome-pref-for-" + cssName },
          React.createElement("input", { ref: "checkbox", type: "checkbox", name: cssName, checked: this.state.val, onClick: this.handleClick }),
          React.createElement(
            "label",
            { "for": cssName },
            name
          ),
          " ",
          React.createElement(
            "span",
            { className: "little gray" },
            "(",
            description || "",
            ")"
          )
        );
      },
      writable: true,
      configurable: true
    },
    handleClick: {
      value: function handleClick() {
        var val = !this.state.val;
        var _props = this.props;
        var plugin = _props.plugin;
        var property = _props.property;

        plugin.set(property, val);
        this.setState({ val: val });
      },
      writable: true,
      configurable: true
    }
  });

  return GnomePrefInput;
})(React.Component);

var GnomePrefs = exports.GnomePrefs = (function (_React$Component2) {
  function GnomePrefs() {
    _classCallCheck(this, GnomePrefs);

    if (_React$Component2 != null) {
      _React$Component2.apply(this, arguments);
    }
  }

  _inherits(GnomePrefs, _React$Component2);

  _prototypeProperties(GnomePrefs, null, {
    render: {
      value: function render() {
        var descriptor = this.props.descriptor;
        var prefs = this.props.plugins.map(function (plugin) {
          var prefs = descriptor[plugin.name].map(function (pref) {
            return React.createElement(GnomePrefInput, { plugin: plugin,
              property: pref.property,
              name: pref.displayName,
              description: pref.description });
          });

          return React.createElement(
            "div",
            { className: "gnome-pref-group" },
            prefs
          );
        });

        return React.createElement(
          "div",
          { className: "gnome-prefs-panel" },
          prefs
        );
      },
      writable: true,
      configurable: true
    }
  });

  return GnomePrefs;
})(React.Component);

var preftableTemplate = exports.preftableTemplate = "<table class=\"preftable pretty-form gnome-prefs-table\">\n  <tr>\n    <th>gnome options</th>\n    <td class=\"prefright\">\n    </td>\n  </tr>\n</table>";
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{"../../jsx/utils":14}],20:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var context = _interopRequire(require("../../jsx/context"));

var Plugin = _interopRequire(require("../../jsx/plugin"));

var hooks = _interopRequire(require("../../jsx/hooks"));

var ReadNext = _interopRequire(require("./views"));

var ReadNextPlugin = (function (Plugin) {
  function ReadNextPlugin() {
    _classCallCheck(this, ReadNextPlugin);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(ReadNextPlugin, Plugin);

  _prototypeProperties(ReadNextPlugin, {
    defaultState: {
      get: function () {
        return {
          lockToBottom: false };
      },
      configurable: true
    }
  }, {
    shouldRun: {
      value: function shouldRun() {
        return _get(Object.getPrototypeOf(ReadNextPlugin.prototype), "shouldRun", this).call(this) && context.page === "comments";
      },
      writable: true,
      configurable: true
    },
    setup: {
      value: function setup() {
        var _this = this;

        hooks.get("init-prefs").on(function (descriptor) {
          descriptor[_this.name].push({
            property: "lockToBottom",
            displayName: "Lock to Bottom",
            description: "lock the widget in the bottom corner instead of the top" });
        });
      },
      writable: true,
      configurable: true
    },
    run: {
      value: function run() {
        var _this = this;

        var subreddit = context.subreddit;
        var thing = context.thing;

        var fullname = "t3_" + thing;
        var params = $.param({
          count: "10",
          after: fullname });
        var requestPath = "/r/" + subreddit + ".json?" + params;
        var mountNode = $.parseHTML("<div class=\"reddit-read-next-mount\"></div>")[0];
        var $mountNode = $(mountNode);

        var lockToBottom = this.state.lockToBottom;

        function shouldComponentLock(widgetNode) {
          var scrollPosition = window.scrollY;
          var nodePosition = $mountNode.position().top;

          if (lockToBottom) {
            var scrollOffset = window.innerHeight;
            var nodeOffset = $(widgetNode).height();

            scrollPosition += scrollOffset;
            nodePosition += nodeOffset;
          }

          return scrollPosition >= nodePosition;
        }

        $.get(requestPath).then(function (res) {
          var postListData = res.data.children.map(function (child) {
            return child.data;
          });
          $("body > .side").append(mountNode);
          var position = _this.state.lockToBottom ? "bottom" : "top";
          React.render(React.createElement(ReadNext, { shouldComponentLock: shouldComponentLock,
            lockedToBottom: lockToBottom,
            posts: postListData,
            subreddit: subreddit,
            position: position }), mountNode);
        });
      },
      writable: true,
      configurable: true
    }
  });

  return ReadNextPlugin;
})(Plugin);

module.exports = ReadNextPlugin;

ReadNextPlugin.meta = {
  displayName: "Read Next Gnome",
  description: "adds a widget to the sidebar on comments page that suggests\nnext posts" };

},{"../../jsx/context":5,"../../jsx/hooks":6,"../../jsx/plugin":10,"./views":21}],21:[function(require,module,exports){
"use strict";

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var regexThumbnail = /^http/;

var Post = exports.Post = (function (_React$Component) {
  function Post() {
    _classCallCheck(this, Post);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Post, _React$Component);

  _prototypeProperties(Post, {
    defaultProps: {
      get: function () {
        return {
          visible: false };
      },
      configurable: true
    }
  }, {
    render: {
      value: function render() {
        var classSet = React.addons.classSet({
          "reddit-read-next-post": true,
          hidden: !this.props.visible });
        var thumb = null;
        var _props = this.props;
        var title = _props.title;
        var score = _props.score;
        var count = _props.num_comments;
        var permalink = _props.permalink;
        var thumbnail = _props.thumbnail;

        if (regexThumbnail.test(thumbnail)) {
          thumb = React.createElement(
            "div",
            { className: "thumbnail" },
            React.createElement("img", { src: thumbnail })
          );
        }

        return React.createElement(
          "a",
          { href: permalink, className: classSet },
          React.createElement(
            "div",
            { className: "reddit-read-next-meta" },
            React.createElement(
              "span",
              null,
              score,
              " points"
            ),
            " · ",
            React.createElement(
              "span",
              null,
              count,
              " comments"
            )
          ),
          thumb,
          React.createElement(
            "div",
            { className: "reddit-read-next-title" },
            title
          )
        );
      },
      writable: true,
      configurable: true
    }
  });

  return Post;
})(React.Component);

var ReadNext = (function (_React$Component2) {
  function ReadNext(props) {
    _classCallCheck(this, ReadNext);

    _get(Object.getPrototypeOf(ReadNext.prototype), "constructor", this).call(this, props);
    this.state = {
      index: 0,
      fixed: false };

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
  }

  _inherits(ReadNext, _React$Component2);

  _prototypeProperties(ReadNext, {
    defaultProps: {
      get: function () {
        return {
          posts: [] };
      },
      configurable: true
    }
  }, {
    componentDidMount: {
      value: function componentDidMount() {
        var _this = this;

        var shouldComponentLock = this.props.shouldComponentLock;

        var node = React.findDOMNode(this);

        window.addEventListener("scroll", function () {
          _this.setState({
            fixed: shouldComponentLock(node) });
        });
      },
      writable: true,
      configurable: true
    },
    next: {
      value: function next() {
        var l = this.props.posts.length;
        var i = this.state.index;

        this.setState({
          index: (i + 1) % l });
      },
      writable: true,
      configurable: true
    },
    prev: {
      value: function prev() {
        var l = this.props.posts.length;
        var i = this.state.index;

        this.setState({
          index: (i + l - 1) % l });
      },
      writable: true,
      configurable: true
    },
    render: {
      value: function render() {
        if (!this.props.posts || !this.props.posts.length) {
          return null;
        }

        var index = this.state.index;
        var _props = this.props;
        var subreddit = _props.subreddit;
        var posts = _props.posts;

        var fullSubreddit = "/r/" + subreddit;
        posts = posts.map(function (post, i) {
          return React.createElement(Post, _extends({}, post, { visible: index === i, key: i }));
        });
        var classSet = React.addons.classSet({
          "reddit-read-next": true,
          fixed: this.state.fixed,
          "fixed-to-bottom": this.props.lockedToBottom });

        return React.createElement(
          "div",
          { className: classSet },
          React.createElement(
            "header",
            null,
            "also in ",
            React.createElement(
              "a",
              { href: fullSubreddit },
              fullSubreddit
            ),
            React.createElement(
              "div",
              { className: "reddit-read-next-nav" },
              React.createElement(
                "span",
                { className: "reddit-read-next-button", onClick: this.prev },
                "<"
              ),
              React.createElement(
                "span",
                { className: "reddit-read-next-button", onClick: this.next },
                ">"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "reddit-read-next-post-list" },
            posts
          )
        );
      },
      writable: true,
      configurable: true
    }
  });

  return ReadNext;
})(React.Component);

exports["default"] = ReadNext;
Object.defineProperty(exports, "__esModule", {
  value: true
});

},{}],22:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Plugin = _interopRequire(require("../../jsx/plugin"));

var context = _interopRequire(require("../../jsx/context"));

var isSubreddit = function (result) {
  return result.kind === "t5";
};

var isPost = function (result) {
  return result.kind === "t3";
};

var fakeThumbnails = new Set(["self", "default", "nsfw"]);

var hasThumbnail = function (result) {
  var thumbnail = result.data.thumbnail;

  return thumbnail && !fakeThumbnails.has(thumbnail);
};

var classSet = function (classDesc) {
  return Object.keys(classDesc).filter(function (key) {
    return classDesc[key];
  }).join(" ");
};

var getTemplateClasses = function (result) {
  return classSet({
    "gnome-sr-search-result": true,
    "gnome-sr-post-result": isPost(result),
    "gnome-sr-subreddit-result": isSubreddit(result),
    "gnome-sr-has-thumbnail": hasThumbnail(result) });
};

var renderPostThumbnail = function (result) {
  if (!hasThumbnail(result)) {
    return "";
  }

  return "<div class=\"gnome-sr-thumbnail\">\n    <img src=\"" + result.data.thumbnail + "\">\n  </div>";
};

var queryPattern = new RegExp("(" + context.query.q + ")", "igm");

var highlightQuery = function (text) {
  return text.replace(queryPattern, "<strong>$1</strong>");
};

var renderPostSelftext = function (result) {
  if (!result.data.selftext) {
    return "";
  }

  return "<div class=\"gnome-sr-description\">\n    " + highlightQuery(result.data.selftext) + "\n  </div>";
};

var getIconClasses = function (type) {
  return "gnome-sr-icon gnome-sr-icon-" + type;
};

var renderIconLink = function (iconType, url, displayText) {
  if (!url) {
    return "";
  }

  if (!displayText) {
    displayText = url;
  }

  var iconLinkClasses = getIconClasses(iconType);

  return "<div class=\"gnome-sr-link-container\">\n    <span class=\"" + iconLinkClasses + "\"></span>\n    <a class=\"gnome-sr-link\" href=\"" + url + "\">" + displayText + "</a>\n  </div>";
};

var renderPostLink = function (result) {
  return renderIconLink("external", result.data.url);
};

var renderPostResult = function (result) {
  return "<!-- post result type -->\n  " + renderPostThumbnail(result) + "\n  <div class=\"gnome-sr-title-container\">\n    <a class=\"gnome-sr-title\" href=\"" + result.data.permalink + "\">\n       " + highlightQuery(result.data.title) + "</a>\n    <a class=\"gnome-sr-subtitle\" href=\"/r/" + result.data.subreddit + "\">\n       /r/" + highlightQuery(result.data.subreddit) + "</a>\n  </div>\n  <div class=\"gnome-sr-meta\">\n    " + result.data.score + " points,\n    " + result.data.num_comments + " comments,\n    submitted [some time] ago\n    by " + result.data.author + "\n  </div>\n  " + renderPostSelftext(result) + "\n  " + renderPostLink(result);
};

var renderSubredditRelation = function (result) {
  var label = "";

  if (result.data.user_is_moderator) {
    label = "moderator";
  } else if (result.data.user_is_contributor) {
    label = "contributor";
  } else if (result.data.user_is_subsriber) {
    label = "subscribed";
  }

  if (!label) {
    return "";
  }

  return "<span class=\"gnome-sr-subreddit-relation\">" + label + "</span>";
};

var renderSubredditDescription = function (result) {
  if (!result.data.public_description) {
    return "";
  }

  return "<div class=\"gnome-sr-description\">\n    " + highlightQuery(result.data.public_description) + "\n  </div>";
};

var renderSubredditFilterLink = function (result) {
  return renderIconLink("filter", "" + result.data.url + "subreddit-search" + location.search + "&restrict_sr=on", "search in " + result.data.url);
};

var renderSubredditResult = function (result) {
  return "<!-- subreddit result type -->\n  <div class=\"gnome-sr-title-container\">\n    <a class=\"gnome-sr-title\" href=\"" + result.data.url + "\">\n       " + highlightQuery(result.data.title) + "</a>\n    <a class=\"gnome-sr-subtitle\" href=\"" + result.data.url + "\">\n       /r/" + highlightQuery(result.data.display_name) + "</a>\n  </div>\n  <div class=\"gnome-sr-meta\">\n    " + renderSubredditRelation(result) + "\n    " + result.data.subscribers + " subscribers,\n    a community for [some time].\n  </div>\n  " + renderSubredditDescription(result) + "\n  " + renderSubredditFilterLink(result);
};

var renderResult = function (result) {
  var content = "";

  if (isSubreddit(result)) {
    content = renderSubredditResult(result);
  } else if (isPost(result)) {
    content = renderPostResult(result);
  }

  if (!content) {
    return "";
  }

  return "<div class=\"" + getTemplateClasses(result) + "\">" + content + "</div>";
};

var renderGroup = function (name, contents, moreLink) {
  return "<div class=\"gnome-sr-result-group\">\n  <div class=\"gnome-sr-result-group-header\">\n    " + name + "\n  </div>\n  <div class=\"gnome-sr-result-group-contents\">\n    " + contents.join("\n") + "\n  </div>\n  <div class=\"gnome-sr-more-results-container\">\n    <a class=\"gnome-sr-more-results\" href=\"" + moreLink + "\">more " + name + " results »</a>\n  </div>\n</div>";
};

var renderSearchForm = function (defaultVal) {
  return "<div class=\"gnome-sr-search-form\">\n  <form action=\"/subreddit-search\" method=\"GET\">\n    <input name=\"q\" value=\"" + defaultVal + "\" placeholder=\"search\">\n  </form>\n</div>";
};

var SubredditSearch = (function (Plugin) {
  function SubredditSearch() {
    _classCallCheck(this, SubredditSearch);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(SubredditSearch, Plugin);

  _prototypeProperties(SubredditSearch, null, {
    shouldRun: {
      value: function shouldRun() {
        return context.page === "subreddit-search";
      },
      writable: true,
      configurable: true
    },
    run: {
      value: function run() {
        var searchQuery = location.search.slice(3);
        var $container = $("body > div.content");

        $container.empty();
        $("#header .pagename").text("search + subreddits");

        if (searchQuery) {
          var postSearchEndpoint;

          var searches = [];

          if (context.subreddit) {
            searches.push("/r/" + context.subreddit + "/search.json" + location.search);
          } else {
            searches.push("/search.json" + location.search);
            searches.push("/subreddits/search.json" + location.search + "&limit=5");
          }

          var searchResults = searches.map(function (query) {
            return $.get(query).then(function (res) {
              return res.data.children;
            });
          });

          $.when.apply($, searchResults).then(function (posts, subreddits) {
            var exactMatch = "";
            var renderedSubreddits = "";
            var renderedPosts = "";

            if (posts && posts.length) {
              renderedPosts = posts.map(function (x) {
                return renderResult(x);
              });
              var moreLink = "/search" + location.search;

              if (context.subreddit) {
                moreLink = "/r/" + context.subreddit + "" + moreLink;
              }

              var lastPost = posts[posts.length - 1];
              moreLink += "&after=" + lastPost.data.name;

              renderedPosts = renderGroup("posts", renderedPosts, moreLink);
            }

            if (subreddits && subreddits.length) {
              var testDisplayName = subreddits[0].data.display_name.toLowerCase();
              var testQuery = context.query.q.toLowerCase();

              if (testDisplayName === testQuery) {
                exactMatch = "<div class=\"gnome-sr-result-group\">\n              <div class=\"gnome-sr-result-group-contents\">\n                " + renderResult(subreddits[0]) + "\n              </div>\n            </div>";
                subreddits = subreddits.slice(1);
              }
            }

            if (subreddits && subreddits.length) {
              renderedSubreddits = subreddits.map(function (x) {
                return renderResult(x);
              });
              var moreLink = "/subreddits/search" + location.search;
              var lastSubreddit = subreddits[subreddits.length - 1];
              moreLink += "&after=" + lastSubreddit.data.name;
              renderedSubreddits = renderGroup("subreddits", renderedSubreddits, moreLink);
            }

            $container.html("<div class=\"gnome-sr-page\">\n          " + renderSearchForm(searchQuery) + "\n          " + exactMatch + "\n          " + renderedSubreddits + "\n          " + renderedPosts + "\n        </div>");
          });
        } else {
          $container.html("<div class=\"gnome-sr-page\">\n          " + renderSearchForm(searchQuery) + "\n        </div>");
        }
      },
      writable: true,
      configurable: true
    }
  });

  return SubredditSearch;
})(Plugin);

module.exports = SubredditSearch;

SubredditSearch.meta = {
  displayName: "Subreddit Search",
  description: "mockup of subreddits in search results" };

},{"../../jsx/context":5,"../../jsx/plugin":10}],23:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Plugin = _interopRequire(require("../../jsx/plugin"));

var hooks = _interopRequire(require("../../jsx/hooks"));

var template = function (classFound) {
  return "--------\ntest init function has run!\nthe html element does " + (classFound ? "" : "not ") + "have the \n'gnome-test' class.\n--------";
};

var TestPlugin = (function (Plugin) {
  function TestPlugin() {
    _classCallCheck(this, TestPlugin);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(TestPlugin, Plugin);

  _prototypeProperties(TestPlugin, {
    defaultState: {
      get: function () {
        return {
          testing: true };
      },
      configurable: true
    }
  }, {
    setup: {
      value: function setup() {
        var _this = this;

        hooks.get("init-prefs").on(function (descriptor) {
          descriptor[_this.name].push({
            property: "testing",
            displayName: "Testing",
            description: "nothing to see here" });
        });
      },
      writable: true,
      configurable: true
    },
    run: {
      value: function run() {
        var gnomeClassFound = $("html").hasClass("gnome-test");
        console.log(template(gnomeClassFound));
      },
      writable: true,
      configurable: true
    }
  });

  return TestPlugin;
})(Plugin);

module.exports = TestPlugin;

TestPlugin.meta = {
  displayName: "Gnome Test",
  description: "checks for the existence of the gnome css class" };

},{"../../jsx/hooks":6,"../../jsx/plugin":10}],24:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Plugin = _interopRequire(require("../../jsx/plugin"));

var context = _interopRequire(require("../../jsx/context"));

var Location = _interopRequire(require("../../jsx/location"));

var unsafe = require("../../jsx/utils").unsafe;

var buttonTemplate = "<li>\n  <a class=\"reddit-prototype-top-comment\" href=\"#\">[top comment]</a>\n</li>";

var commentTemplate = function (body) {
  return "<div class=\"reddit-prototype-top-comment-text md-container\">\n  " + body + "\n</div>";
};

var TopCommentPlugin = (function (Plugin) {
  function TopCommentPlugin() {
    _classCallCheck(this, TopCommentPlugin);

    if (Plugin != null) {
      Plugin.apply(this, arguments);
    }
  }

  _inherits(TopCommentPlugin, Plugin);

  _prototypeProperties(TopCommentPlugin, null, {
    shouldRun: {
      value: function shouldRun() {
        return _get(Object.getPrototypeOf(TopCommentPlugin.prototype), "shouldRun", this).call(this) && !context.page;
      },
      writable: true,
      configurable: true
    },
    run: {
      value: function run() {
        var _this = this;

        var $things = $("#siteTable .thing");

        if (!$things.length) {
          return;
        }

        var onFrontpage = !context.subreddit;

        $things.each(function () {
          var $this = $(this);
          // check the number of comments first
          var comments = parseInt($this.find(".comments").text().split(" ")[0], 10) | 0;

          if (!comments) {
            return;
          }

          $this.find(".buttons").append($.parseHTML(buttonTemplate));
        });

        var handleClick = function ($elem) {
          var $parent = $elem.closest(".thing");
          var fullname = $parent.data("fullname");
          var id = fullname.split("_")[1];

          var pathObj;

          if (onFrontpage) {
            var parentURL = $parent.find("a.subreddit").attr("href");
            pathObj = Location.parseURL(parentURL);
          } else {
            pathObj = context;
          }

          _this.requestComment(pathObj.pathname, id, function (body) {
            var node = $.parseHTML(commentTemplate(body));
            $parent.find(".entry").append(node);
            $elem.remove();
          });
        };

        $("#siteTable").on("click", "a.reddit-prototype-top-comment", function (e) {
          var $this = $(this);

          e.preventDefault();
          handleClick($this);
        });
      },
      writable: true,
      configurable: true
    },
    requestComment: {
      value: function requestComment(pathname, id, cb) {
        var params = $.param({
          limit: 1,
          sort: "top" });
        var path = "" + pathname + "/comments/" + id + ".json?" + params;

        $.get(path).then(function (res) {
          var comment = res[1].data.children[0].data;
          var body = unsafe(comment.body_html);
          cb(body);
        });
      },
      writable: true,
      configurable: true
    }
  });

  return TopCommentPlugin;
})(Plugin);

module.exports = TopCommentPlugin;

TopCommentPlugin.meta = {
  displayName: "Top Comment Gnome",
  description: "adds a link to posts on listing pages to load the top comment inline",
  cssClassName: "top-comment" };

},{"../../jsx/context":5,"../../jsx/location":7,"../../jsx/plugin":10,"../../jsx/utils":14}]},{},[8]);
