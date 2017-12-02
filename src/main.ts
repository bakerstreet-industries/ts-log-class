
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
  return function (target: any): void {
    let pt = target.prototype;
    Object.keys(pt).forEach(key => {
      let fn: IPatchedMethod = applyisMethod(pt[key]);
      if (!fn.isPatched && fn.isAMethod) {
        pt[key] = applyMonkeyPatch(fn, key, opts);
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

function applyMonkeyPatch(method: IPatchedMethod, methodName: string, opts: ILogOptions): Function {
  method.isPatched = true;
  console.log('What is this?1', this);
  return (...rest): any => {
    let result = method.apply(this, rest);
    console.log('What is this?2', this);
    waitForResult(result).then(val => {
      console.log('What is this?3', this);
      opts.out(
        opts.hook({
          arguments: [],
          className: this.constructor ? this.constructor.name : '[UNKNOWN_CLASS_NAME]',
          properties: [],
          result: val,
          timestamp: Date.now(),
        })
      );
    });
    return result;
  }
}

function defaultHook(props: IHookProperties): string {
  return "loooooooooooooool";
}

function waitForResult(result): Promise<any> {
  return new Promise(resolve => {
    if (result instanceof Promise) {
      result.then(val => resolve(val));
    } else {
      resolve(result);
    }
  });
}
