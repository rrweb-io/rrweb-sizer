import { getSize } from "../../src/libs/size";
import { e1 } from "../__fixture__/";

describe("get size", () => {
  it("get byte size of string", () => {
    expect(getSize(e1.content)).toEqual(e1.size);
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
