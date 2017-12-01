import chai = require("chai");
import log from "../src/main";

@log()
class MockClass {
    public doStuff(): string {
        return "Mock did stuff!";
    }
}

describe("ts-logger", () => {
    it("Should Monkey patch the output", () => {
        chai.expect(new MockClass().doStuff()).to.equal("Mock did stuff! - MONKEYED");
    });
});
