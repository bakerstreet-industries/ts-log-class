(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_OPTS = {
    hook: defaultHook,
    out: console.log
};
/**
 * Default options that are used for the log function when specific options are not passed.
 *
 * @export
 * @param {ILogOptions} options
 */
function setDefault(options) {
    if (options.hook) {
        DEFAULT_OPTS.hook = options.hook;
    }
    if (options.out) {
        DEFAULT_OPTS.out = options.out;
    }
}
exports.setDefault = setDefault;
/**
 * Builds a set of properties, `IHookProperties`, that are passed into an `out` function. By default the properties
 * are formed into a message using JSON.stringify and `out` to `console.log`.
 *
 * You may override the default `hook` method to format the message output however you like and overide
 * the `out` method with any function matching this interface: `(message?: any, ...optionalParams: any[]) => void`.
 *
 * If you would like to override the `hook` and, or `out` functions for every usage of the `log` function, use
 * `setDefault`.
 *
 * @export
 * @param {ILogOptions} [opts=null]
 * @returns {((target) => void)}
 */
function log(opts) {
    if (opts === void 0) { opts = null; }
    if (!opts) {
        opts = {};
    }
    if (!opts.hook) {
        opts.hook = DEFAULT_OPTS.hook;
    }
    if (!opts.out) {
        opts.out = DEFAULT_OPTS.out;
    }
    return function (target) {
        var pt = target.prototype;
        Object.keys(pt).forEach(function (key) {
            var fn = applyisMethod(pt[key]);
            if (fn && !fn.isPatched && fn.isAMethod) {
                pt[key] = applyMonkeyPatch(pt, fn, key, opts);
            }
        });
    };
}
exports.default = log;
function applyisMethod(allegedFn) {
    if (typeof (allegedFn) === "function") {
        allegedFn.isAMethod = true;
    }
    return allegedFn;
}
function applyMonkeyPatch(prototype, method, methodName, opts) {
    method.isPatched = true;
    return function () {
        var _this = this;
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        var doLog = function (val) {
            opts.out(opts.hook({
                className: prototype.constructor.name,
                methodName: methodName,
                timestamp: Date.now(),
                arguments: buildParameterHash(rest, method),
                properties: buildPropertyHash(_this),
                result: val,
            }));
            //console.log(opts.out === console.log, 'What?!@', opts.out, console.log);
        };
        var result = method.apply(prototype, rest);
        if (result instanceof Promise) {
            return result.then(function (val) {
                doLog(val);
                return val;
            }).catch(function (reason) {
                doLog(reason);
                return reason;
            });
        }
        doLog(result);
        return result;
    };
}
function defaultHook(props) {
    return JSON.stringify(props);
}
function buildParameterHash(parameterValues, method) {
    var fnStr = method.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var parameterNames = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    var hash = {};
    if (parameterNames === null)
        return hash;
    parameterNames.forEach(function (value, idx) {
        hash[value] = JSON.stringify(parameterValues[idx]);
    });
    return hash;
}
;
function buildPropertyHash(instance) {
    var hash = {};
    Object.keys(instance).forEach(function (key) {
        hash[key] = JSON.stringify(instance[key]);
    });
    return hash;
}


/***/ })
/******/ ])));