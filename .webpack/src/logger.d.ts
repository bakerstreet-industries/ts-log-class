export declare class Logger {
    private logdown;
    private namespace;
    private environment;
    constructor(namespace: string, environment: any);
    info(...args: Array<any>): void;
    log(...args: Array<any>): void;
    warn(...args: Array<any>): void;
    error(...args: Array<any>): void;
    debug(...args: Array<any>): void;
}
