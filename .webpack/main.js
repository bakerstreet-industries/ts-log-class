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
function log(opts) {
    if (opts === void 0) { opts = null; }
    if (!opts) {
        opts = {};
    }
    if (!opts.hook) {
        opts.hook = defaultHook;
    }
    if (!opts.out) {
        opts.out = console.log;
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
                arguments: buildParameterKeyValList(rest, method),
                className: prototype.constructor.name,
                properties: Object.keys(_this).map(function (key) {
                    return "[" + key + "=" + JSON.stringify(_this[key]) + "]";
                }),
                result: val,
                timestamp: Date.now(),
            }));
            //console.log(opts.out === console.log, 'What?!@', opts.out, console.log);
        };
        var result = method.apply(prototype, rest);
        if (result instanceof Promise) {
            return result.then(function (val) {
                doLog(val);
                return val;
            });
        }
        doLog(result);
        return result;
    };
}
function defaultHook(props) {
    return JSON.stringify(props);
}
function buildParameterKeyValList(parameterValues, method) {
    var fnStr = method.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var parameterNames = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if (parameterNames === null)
        return [];
    return parameterNames.map(function (value, argNameIndex) {
        return "[" + parameterNames[argNameIndex] + "=" + JSON.stringify(parameterValues[argNameIndex]) + "]";
    });
}
;


/***/ })
/******/ ])));