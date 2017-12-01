
export function LogClass(): ((target) => void) {

    return function (target: any): void {
        Object.keys(target).forEach(key => {
            let fn: IPatchedMethod = applyisMethod(target.prototype[key]);

            if (!fn.isPatched && fn.isAMethod) {
                target.prototype[key] = LogFunction(fn, key);
            }
        });
    };

}

export function LogFunction(method: IPatchedMethod, methodName: string) {

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
