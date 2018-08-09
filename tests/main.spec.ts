import { IHookProperties, ILogOptions } from './../src/main';
import * as chai from "chai";
import * as spies from "chai-spies";
import log, { IHasTsLogClassLogger } from "../src/main";

chai.use(spies);

function wrappedConsoleLog(message: string, ...rest): void {
  console.log.apply(this, [message].concat(rest));
}

function wrappedConsoleErr(message: string, ...rest): void {
  console.error.apply(this, [message].concat(rest));
}

let messages = [];

function samplePropertyHook(props: IHookProperties): string {
  props.timestamp = 0;
  const message = JSON.stringify(props);
  messages.push(message);
  return message;
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

@log({ out: wrappedConsoleErr, hook: samplePropertyHook })
class MockLogErr {
  coolStuff(): void {}
}

@log({ out: wrappedConsoleLog, hook: samplePropertyHook, strategy: 'before-after' })
class MockLogBeforeAfter {
  coolStuff(): string {
    return "TEST";
  }
}

@log({ out: wrappedConsoleLog, hook: samplePropertyHook })
class MockLogImplements implements IHasTsLogClassLogger {
  tsLogClassLogger = console.warn
  coolStuff(): string {
    return "TEST";
  }
}


describe("ts-log-class", () => {
  let sandbox: ChaiSpies.Sandbox
  beforeEach(() => {
    messages = []
    sandbox = chai.spy.sandbox()
  })
  afterEach(() => {
    sandbox.restore()
  })
  it("Should log output to console.log", done => {
    //Wrapping conosle.log in a spy prevents the default `out`, which is assigned to console.log, from being called
    //since the spy itself has wrapped console.log
    //Proof - console.log(opts.out === console.log) //false when chai.spy.on(console, 'log') and the default out is used.
    //In order spy on console.log, we have to have a function that wraps console.log in order to spy on it.
    let spy = sandbox.on(console, 'log');
    let mc = new MockClass();
    mc.prop1 = "ok";
    mc.doStuff("abc");

    chai.expect(spy).to.have.been.called();
    chai.expect(messages.length).to.be.equal(1);
    chai.expect(messages[0]).to.equal('{"when":"after","className":"MockClass","methodName":"doStuff","timestamp":0,"arguments":{"sampleParam":"\\\"abc\\\""},"properties":{"prop1":"\\"ok\\""},"result":"Mock did stuff!"}');

    new MockClass().doFailAsyncStuff()
      .catch(reason => {
        chai.expect(spy).to.have.been.called.twice;
        chai.expect(messages.length).to.be.equal(2);
        chai.expect(messages[1]).to.equal('{"when":"after","className":"MockClass","methodName":"doFailAsyncStuff","timestamp":0,"arguments":{},"properties":{"prop1":"\\"sweet\\""},"result":"#FAIL"}');
        return reason;
      })
      .then(() => new MockClass().doAsyncStuff())
      .then(() => {
        chai.expect(spy).to.have.been.called.exactly(3);
        chai.expect(messages.length).to.be.equal(3);
        chai.expect(messages[2]).to.equal('{"when":"after","className":"MockClass","methodName":"doAsyncStuff","timestamp":0,"arguments":{},"properties":{"prop1":"\\"sweet\\""},"result":{"sample":"output"}}');
      })
      .then(() => done());
  });

  it("Should log output to console.log before and after", () => {
    const spy = sandbox.on(console, 'log');
    const mc = new MockLogBeforeAfter();
    mc.coolStuff();

    chai.expect(spy).to.have.been.called.twice;
    chai.expect(messages.length).to.be.equal(2);
    chai.expect(messages[0]).to.equal('{"when":"before","className":"MockLogBeforeAfter","methodName":"coolStuff","timestamp":0,"arguments":{},"properties":{}}');
    chai.expect(messages[1]).to.equal('{"when":"after","className":"MockLogBeforeAfter","methodName":"coolStuff","timestamp":0,"arguments":{},"properties":{},"result":"TEST"}');
  });

  it("Should use implemented logger", () => {
    const spyOut = sandbox.on(console, 'log');
    const mc = new MockLogImplements();
    const spyLogger = sandbox.on(mc, 'tsLogClassLogger')
    mc.coolStuff();

    chai.expect(spyOut).to.have.not.been.called();
    chai.expect(spyLogger).to.have.been.called.once;
    chai.expect(messages.length).to.be.equal(1);
    chai.expect(messages[0]).to.equal('{"when":"after","className":"MockLogImplements","methodName":"coolStuff","timestamp":0,"arguments":{},"properties":{},"result":"TEST"}');
  });

  it("Should log output to console.error", () => {
    let spy = sandbox.on(console, 'error');
    new MockLogErr().coolStuff();
    chai.expect(spy).to.have.been.called.once;
    chai.expect(messages.length).to.be.equal(1);
  });
});
