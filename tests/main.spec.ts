import chai = require("chai");
import spies = require("chai-spies")
import log from "../src/main";

chai.use(spies);

function wrappedConsoleLog(message: string, ...rest): void {
  console.log.apply(this, [message].concat(rest));
}

@log({out: wrappedConsoleLog})
class MockClass {
  public prop1 = "sweet";

  public doStuff(sampleParam: string): string {
    return "Mock did stuff!";
  }
  public doAsyncStuff(): Promise<{ sample: string }> {
    return Promise.resolve({
      sample: 'output'
    });
  }
}


describe("ts-logger", () => {
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

    new MockClass().doAsyncStuff()
      .then(val => chai.expect(spy).to.have.been.called.twice)
      .then(() => done());
  });
});
