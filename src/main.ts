
export default function log(opts: ILogOptions = null): ((target) => void) {
  if (!opts) {
    opts = {};
  }
  if (!opts.hook) {
    opts.hook = defaultHook;
  }
  if (!opts.out) {
    opts.out = console.log;
  }
  return function (target): void {
    let pt = target.prototype;
    Object.keys(pt).forEach(key => {
      let fn: IPatchedMethod = applyisMethod(pt[key]);
      if (fn && !fn.isPatched && fn.isAMethod) {
        pt[key] = applyMonkeyPatch(pt, fn, key, opts);
      }
    });
  };
}

export interface ILogOptions {
  hook?: (logProps: IHookProperties) => string;
  out?: (message?: any, ...optionalParams: any[]) => void;
}

export interface IHookProperties {
  timestamp: number;
  className: string;
  arguments: string[];
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

function applyMonkeyPatch(prototype, method: IPatchedMethod, methodName: string, opts: ILogOptions): Function {
  method.isPatched = true;

  return function (...rest): any {
    const doLog = (val) => {
      opts.out(
        opts.hook({
          arguments: buildParameterKeyValList(rest, method),
          className: prototype.constructor.name,
          properties: Object.keys(this).map(key => {
            return `[${key}=${JSON.stringify(this[key])}]`;
          }),
          result: val,
          timestamp: Date.now(),
        })
      );
      //console.log(opts.out === console.log, 'What?!@', opts.out, console.log);
    }
    let result = method.apply(prototype, rest);
    if (result instanceof Promise) {
      return result.then(val => {
        doLog(val);
        return val;
      })
    }

    doLog(result);
    return result;
  }
}

function defaultHook(props: IHookProperties): string {
  return JSON.stringify(props);
}

function buildParameterKeyValList(parameterValues: any[], method: Function): string[] {
  const fnStr = method.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
  let parameterNames: string[] | null = fnStr.slice(
    fnStr.indexOf('(') + 1,
    fnStr.indexOf(')')
  ).match(/([^\s,]+)/g);
  if (parameterNames === null)
    return [];

  return parameterNames.map((value: string, argNameIndex: number): string => {
    return `[${parameterNames[argNameIndex]}=${JSON.stringify(parameterValues[argNameIndex])}]`
  });
};
