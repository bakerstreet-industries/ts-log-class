import chai = require("chai");
import spies = require("chai-spies")
import log from "../src/main";

chai.use(spies);

class BaseMockClass {
  public doStuff(): string {
    return "Mock did stuff!";
  }
  public doAsyncStuff(): Promise<{ sample: string }> {
    return Promise.resolve({
      sample: 'output'
    });
  }
}

describe("ts-logger", () => {
  it("Should Log output to console.log", done => {
    let spy = chai.spy.on(console, 'log');
    new BaseMockClass().doStuff();
    chai.expect(spy).to.not.have.been.called();

    new BaseMockClass().doAsyncStuff()
      .then(val => chai.expect(spy).to.not.have.been.called())
      .then(() => done());
  });
});
