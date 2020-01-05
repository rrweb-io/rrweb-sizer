import { MsgpackPacker } from "../../src/packers/msgpack";
import { parse } from "../../src/libs/analyze";
import { getSize } from "../../src/libs/size";
import { e1, e2 } from "../__fixture__";

const e1Events = parse(e1.content);
const e2Events = parse(e2.content);

describe.skip("msgpack packer", () => {
  const packer = new MsgpackPacker();

  it("pack and unpack correctly", () => {
    expect(packer.unpack(packer.pack(e1Events))).toEqual(e1Events);
  });

  it("has smaller size: e1", () => {
    const packedSize = getSize(packer.pack(e1Events));
    expect(packedSize).toBeLessThan(e1.size);
    expect({
      packedSize,
      size: e1.size
    }).toMatchInlineSnapshot();
  });

  it("has smaller size: e2", () => {
    const packedSize = getSize(packer.pack(e2Events));
    expect(packedSize).toBeLessThan(e2.size);
    expect({
      packedSize,
      size: e2.size
    }).toMatchInlineSnapshot();
  });
});
