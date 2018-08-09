# ts-log-class

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ba3c6402e7eb4c248154c8f686a7df4b)](https://www.codacy.com/app/Roustalski/ts-log-class?utm_source=github.com&utm_medium=referral&utm_content=bakerstreet-industries/ts-log-class&utm_campaign=badger)
[![Build Status](https://travis-ci.org/bakerstreet-industries/ts-log-class.svg?branch=master)](https://travis-ci.org/bakerstreet-industries/ts-log-class)
[![Coverage Status](https://coveralls.io/repos/github/bakerstreet-industries/ts-log-class/badge.svg?branch=master)](https://coveralls.io/github/bakerstreet-industries/ts-log-class?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/ts-log-class.svg)](https://badge.fury.io/js/ts-log-class)


`ts-log-class` is a helper utility that will add log output for all methods of a class by adding a `@log` decorator to the class definition. Stop adding console.log or other logging strategies within each method, but have it done for you. This utility was written specifically for test compaitibility as part of the [aws-ts-starter](https://github.com/bakerstreet-industries/aws-ts-starter).


## Install

`npm install --save ts-log-class`

## Usage

```ts
import log from "ts-log-class";

@log()
export class Car {
  numWheels: number = 4;

  drive(mph: number): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Driving ${mph.toString()}mph!`);
      }, 100);
    });
  }
}
```

You can also implement IHasTsLogClassLogger you ts-log-class will use imeplemnted logger. Could be useful if you want want to log parent classes, but the logger will be defined in child classes.

```ts
import log, { IHasTsLogClassLogger } from "ts-log-class";

@log()
export class Car implements IHasTsLogClassLogger {
  numWheels: number = 4;
  tsLogClassLogger = console.log
  // Will use tsLogClassLogger for logging

  drive(mph: number): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Driving ${mph.toString()}mph!`);
      }, 100);
    });
  }
}
```


See [main.spec.ts](https://github.com/bakerstreet-industries/ts-log-class/blob/master/tests/main.spec.ts) for additional usage examples.


## Output

The default usage without passing in any configuration options to the log function will return the following, including the result of a `Promise`.

new Car().drive(32);

`console.log` output:
```
{"when":"after","className":"Car","methodName":"drive","timestamp":1513536484430,"arguments":{"mph": 32},"properties":{"numWheels": 4},"result":"Driving 32mph!"}
```

## Options

The decorator, `@log()` takes in a configuration object `ILogOptions` with `hook`, `out`, `strategy` properties.

### Hook

The hook property is a function implementing the `IHookProperties` interface. Your method is provided the following properties:
* `className` - The name of the class.
* `methodName` - The name of the executing function.
* `timestamp` - An Epoch of when the `Out` option function is invoked.
* `arguments` - An object with each argument nam as the key, and each argument value as the value.
* `properties` - An object with each property name as the key, and each property value as the value.
* `result` - The return value of the function. If the result is a `Promise`, the return value will equal the result of the `Promise` once it resolves.

### Out

By default, `console.log`, but any function implementing the `console.log` interface will do: `(message?: any, ...optionalParams: any[]) => void`

### Strategy

By default, it logs after function execution (strategy = `after`), You can set it to `before-after` to make it log twice: before and after function execution.
