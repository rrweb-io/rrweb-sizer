import { getSize } from "../../src/libs/size";
import { realWorld } from "../__fixture__/";

describe("get size", () => {
  it("get byte size of string", () => {
    expect(getSize(realWorld.content)).toEqual(realWorld.size);
  });

  const suites = [
    [1, 1],
    ["a", 1],
    ["", 0],
    [{}, 2],
    [{ type: 1 }, 10],
    [true, 4]
  ];

  for (const suite of suites) {
    it(`get size of ${JSON.stringify(suite[0])}`, () => {
      expect(getSize(suite[0])).toEqual(suite[1]);
    });
  }
});
