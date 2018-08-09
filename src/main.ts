import JSON = require("circular-json");

export type ILogStrategies = "after" | "before-after"

/**
 * Builds a set of properties, `IHookProperties`, that are passed into an `out` function. By default the properties
 * are formed into a message using JSON.stringify and `out` to `console.log`.
 *
 * You may override the default `hook` method to format the message output however you like and override
 * the `out` method with any function matching this interface: `(message?: any, ...optionalParams: any[]) => void`.
 * 
 * You can also set a logging strategy. By default it logs after function execution. You can set strategy to 'before-after'
 * to make it log before and after function execution.
 *
 * @export
 * @param {ILogOptions} [opts={}]
 * @returns {((target) => void)}
 */
export default function log(
  {
    hook = defaultHook,
    out = console.log,
    strategy = "after"
  }: ILogOptions = {}
): ((target) => void) {
  return function (target): void {
    let pt = target.prototype;
    let list: string[] = Object.keys(pt).concat(Object.getOwnPropertyNames(pt)).filter((key, idx, arr) => key !== "constructor" && arr.indexOf(key) === idx);
    list.forEach(key => {
      let fn: IPatchedMethod = applyisMethod(pt[key]);
      if (fn && !fn.isPatched && fn.isAMethod) {
        pt[key] = applyMonkeyPatch(target, pt, fn, key, { hook, out, strategy });
      }
    });
  };
}

/**
 * An options interface to override the default logging message builder and output methods.
 *
 * @export
 * @interface ILogOptions
 */
export interface ILogOptions {
  hook?: (logProps: IHookProperties) => string;
  out?: (message?: any, ...optionalParams: any[]) => void;
  strategy?: ILogStrategies
}

export type ILogTime = "before" | "after"

/**
 * The properties that the `hook` method receives to build a message.
 *
 * @export
 * @interface IHookProperties
 */
export interface IHookProperties {
  when: ILogTime;
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
    const doLog = (params: any[], when: ILogTime, val?: any) => {
      opts.out(
        opts.hook({
          when,
          className: prototype.constructor.name,
          methodName,
          timestamp: Date.now(),
          arguments: buildParameterHash(params, method),
          properties: buildPropertyHash(instance),
          result: val,
        })
      );
    }
    let doLogBefore: (message?: any, ...optionalParams: any[]) => void = () => undefined
    if (opts.strategy === "before-after") {
      doLogBefore = (params: any[]) => doLog(params, "before")
    }
    const doLogAfter = (params: any[], result: any) => doLog(params, "after", result)
    let wrapper = function (...params): any {
      doLogBefore(params)
      let result = method.apply(instance, params);
      if (result instanceof Promise) {
        return result.then(val => {
          doLogAfter(params, val);
          return val;
        }).catch(reason => {
          doLogAfter(params, reason);
          return Promise.reject(reason);
        });
      }

      doLogAfter(params, result);
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
  if (parameterNames === null) {
    return hash;
  }

  parameterNames.forEach((value: string, idx: number) => {
    hash[value] = JSON.stringify(parameterValues[idx])
  });

  return hash;
};

function buildPropertyHash(instance: any): { [property: string]: any } {
  let hash = {};
  if (!instance) return hash;
  Object.keys(instance).forEach(key => {
    hash[key] = JSON.stringify(instance[key]);
  });
  return hash;
}
