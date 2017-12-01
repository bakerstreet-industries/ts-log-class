
export default function log(): ((target) => void) {
  return function (target: any): void {
    let pt = target.prototype;
    Object.keys(pt).forEach(key => {
      let fn: IPatchedMethod = applyisMethod(pt[key]);
      if (!fn.isPatched && fn.isAMethod) {
        pt[key] = applyMonkeyPatch(fn, key);
      }
    });
  };
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

function applyMonkeyPatch(method: IPatchedMethod, methodName: string): Function {
  method.isPatched = true;
  return (...rest): any => {
    let result = method.apply(this, rest);
    result += ' - MONKEYED';
    return result;
  }
}
