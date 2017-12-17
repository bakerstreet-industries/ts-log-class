export default function log(opts?: ILogOptions): ((target) => void);
export interface ILogOptions {
    hook?: (logProps: IHookProperties) => string;
    out?: (message?: any, ...optionalParams: any[]) => void;
}
export interface IHookProperties {
    timestamp: number;
    className: string;
    arguments: string[];
    properties: {
        [property: string]: any;
    };
    result: any;
}
