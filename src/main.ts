const DEFAULT_OPTS: ILogOptions = {
  hook: defaultHook,
  out: console.log
};

/**
 * Default options that are used for the log function when specific options are not passed.
 *
 * @export
 * @param {ILogOptions} options
 */
export function setDefault(options: ILogOptions): void {
  if (options.hook) {
    DEFAULT_OPTS.hook = options.hook;
  }
  if (options.out) {
    DEFAULT_OPTS.out = options.out;
  }
}

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
export default function log(opts: ILogOptions = null): ((target) => void) {
  if (!opts) {
    opts = {};
  }
  if (!opts.hook) {
    opts.hook = DEFAULT_OPTS.hook;
  }
  if (!opts.out) {
    opts.out = DEFAULT_OPTS.out;
  }
  return function (target): void {
    let pt = target.prototype;
    let list: string[] = Object.keys(pt).concat(Object.getOwnPropertyNames(pt)).filter((key, idx, arr) => key !== "constructor" && arr.indexOf(key) === idx);
    list.forEach(key => {
      let fn: IPatchedMethod = applyisMethod(pt[key]);
      if (fn && !fn.isPatched && fn.isAMethod) {
        pt[key] = applyMonkeyPatch(target, pt, fn, key, opts);
      }
    });
  };
}

/**
 * An options interface to override the default logging message buildder and output methods.
 *
 * @export
 * @interface ILogOptions
 */
export interface ILogOptions {
  hook?: (logProps: IHookProperties) => string;
  out?: (message?: any, ...optionalParams: any[]) => void;
}

/**
 * The properties that the `hook` method receives to build a message.
 *
 * @export
 * @interface IHookProperties
 */
export interface IHookProperties {
  timestamp: number;
  className: string;
  methodName: string;
  arguments: { [parameterName: string]: any };
  properties: { [property: string]: any };
  result: any;
}

interface IPatchedMethod extends Function {
  isPatched: boolean;
  isAMethod: boolean;
}

function applyisMethod(allegedFn: IPatchedMethod): IPatchedMethod {
  if (typeof (allegedFn) === "function") {
    allegedFn.isAMethod = true;
  }
  return allegedFn;
}

function applyMonkeyPatch(target, prototype, method: IPatchedMethod, methodName: string, opts: ILogOptions): Function {
  method.isPatched = true;

  return function (...rest): any {
    let instance = this;
    let wrapper = function (...rest): any {
      const doLog = (val) => {
        opts.out(
          opts.hook({
            className: prototype.constructor.name,
            methodName: methodName,
            timestamp: Date.now(),
            arguments: buildParameterHash(rest, method),
            properties: buildPropertyHash(instance),
            result: val,
          })
        );
      }
      let result = method.apply(instance, rest);
      if (result instanceof Promise) {
        return result.then(val => {
          doLog(val);
          return val;
        }).catch(reason => {
          doLog(reason);
          return Promise.reject(reason);
        });
      }

      doLog(result);
      return result;
    }
    return wrapper.apply(this, rest);
  }
}

function defaultHook(props: IHookProperties): string {
  return JSON.stringify(props);
}

function buildParameterHash(parameterValues: any[], method: Function): { [parameterName: string]: any } {
  const fnStr = method.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
  let parameterNames: string[] | null = fnStr.slice(
    fnStr.indexOf('(') + 1,
    fnStr.indexOf(')')
  ).match(/([^\s,]+)/g);

  let hash = {};
  if (parameterNames === null)
    return hash;

  parameterNames.forEach((value: string, idx: number) => {
    hash[value] = JSON.stringify(parameterValues[idx])
  });

  return hash;
};

function buildPropertyHash(instance: any): { [property: string]: any } {
  let hash = {};
  Object.keys(instance).forEach(key => {
    hash[key] = JSON.stringify(instance[key]);
  })
  return hash;
}
