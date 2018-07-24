import { IHookProperties } from './main';

export function defaultHook(props: IHookProperties): string {
  return JSON.stringify(props);
}

export function samplePropertyHook(props: IHookProperties): string {
  delete props.result['headers'];
  
  let logger = {
    'className:' : props.className,
    'timestamp' :  props.timestamp, 
    'methodName:' : props.methodName,
    'arguments' : props.arguments,
    'result:' : props.result
    };

  return `${JSON.stringify(logger)}`;
}