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

    //Unfortunately, the wrapping of conosle.log by the spy never gets triggered by the default `out`
    //In order to test and have positive results, we have to have a function that wraps console.log and spy on the wrapper
    let spy = chai.spy.on(console, 'log');
    let mc = new MockClass();
    mc.prop1 = "ok";
    mc.doStuff("abc");

    console.warn('Testing expectation');
    chai.expect(spy).to.have.been.called();

    new MockClass().doAsyncStuff()
      .then(val => chai.expect(spy).to.have.been.called.twice)
      .then(() => done());
  });
});
