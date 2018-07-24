export declare function init(appName: string, environment: any): void;
export declare let DEFAULT_OPTS: ILogOptions;
/**
 * Default options that are used for the log function when specific options are not passed.
 *
 * @export
 * @param {ILogOptions} options
 */
export declare function setDefault(options: ILogOptions): void;
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
export default function log(opts?: ILogOptions): ((target: any) => void);
export declare const logger: any;
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
    arguments: {
        [parameterName: string]: any;
    };
    properties: {
        [property: string]: any;
    };
    result: any;
}
