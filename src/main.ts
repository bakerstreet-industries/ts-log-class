
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

function applyMonkeyPatch(prototype, method: IPatchedMethod, methodName: string, opts: ILogOptions): Function {
  method.isPatched = true;

  return function (...rest): any {
    const doLog = (val) => {
      opts.out(
        opts.hook({
          className: prototype.constructor.name,
          methodName: methodName,
          timestamp: Date.now(),
          arguments: buildParameterHash(rest, method),
          properties: buildPropertyHash(this),
          result: val,
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
