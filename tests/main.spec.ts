import { IHookProperties, ILogOptions } from './../src/main';
import * as chai from "chai";
import * as spies from "chai-spies-next";
import log, { setDefault } from "../src/main";

chai.use(spies);

function wrappedConsoleLog(message: string, ...rest): void {
  console.log.apply(this, [message].concat(rest));
}

function wrappedConsoleErr(message: string, ...rest): void {
  console.error.apply(this, [message].concat(rest));
}

let samplePropReturn = null;

function samplePropertyHook(props: IHookProperties): string {
  props.timestamp = NaN;
  samplePropReturn = `This is an example: ${JSON.stringify(props)}`;
  return samplePropReturn;
}

@log({ out: wrappedConsoleLog, hook: samplePropertyHook })
class MockClass {
  prop1 = "sweet";

  doStuff(sampleParam: string): string {
    return "Mock did stuff!";
  }
  doAsyncStuff(): Promise<{ sample: string }> {
    return Promise.resolve({
      sample: 'output'
    });
  }

  doFailAsyncStuff(): Promise<string> {
    return Promise.reject("#FAIL");
  }
}

@log({ out: wrappedConsoleErr })
class MockLogErr {
  coolStuff(): void {

  }
}

function newDefHook(props: IHookProperties): string {
  return "Hooked.";
}

function newDefOut(message: string, ...rest): void {

}

setDefault({hook: newDefHook, out: newDefOut});
// For code coverage
setDefault({hook: newDefHook});
// For code coverage
setDefault({out: newDefOut});

let opts: ILogOptions = {};

@log(opts)
class MockLogDefaults {

  withDefaults(): any {

  }
}

@log()
class MockLogEmpty {
  get fullNum(): number {
    return 1;
  }
}


describe("ts-log-class", () => {
  it("Should log output to console.log", done => {

    //Wrapping conosle.log in a spy prevents the default `out`, which is assigned to console.log, from being called
    //since the spy itself has wrapped console.log
    //Proof - console.log(opts.out === console.log) //false when chai.spy.on(console, 'log') and the default out is used.
    //In order spy on console.log, we have to have a function that wraps console.log in order to spy on it.
    let spy = chai.spy.on(console, 'log');
    let mc = new MockClass();
    mc.prop1 = "ok";
    mc.doStuff("abc");

    chai.expect(spy).to.have.been.called();

    new MockClass().doFailAsyncStuff()
      .catch(reason => {
        chai.expect(spy).to.have.been.called.twice;
        return reason;
      })
      .then(() => new MockClass().doAsyncStuff())
      .then(val => chai.expect(spy).to.have.been.called.exactly(3))
      .then(() => done());
  });

  it("Should have a property hook called that can return any string based on incoming log properties", () => {
    chai.expect(samplePropReturn).to.equal('This is an example: {"className":"MockClass","methodName":"doAsyncStuff","timestamp":null,"arguments":{},"properties":{"prop1":"\\"sweet\\""},"result":{"sample":"output"}}');
  });

  it("Should log output to console.error", () => {
    let spy = chai.spy.on(console, 'error');
    new MockLogErr().coolStuff();
    chai.expect(spy).to.have.been.called.once;
  });
});
