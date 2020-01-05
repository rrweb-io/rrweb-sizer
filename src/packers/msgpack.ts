import { encode, decode } from "@msgpack/msgpack";
import { eventWithTime } from "rrweb/typings/types";
import { Packer, PackedData } from "./base";

export class MsgpackPacker implements Packer {
  version = 1;

  pack(events: eventWithTime[]): string {
    const packedString = encode(events).join(",");
    const data: PackedData<string> = {
      meta: {
        packer: "msgpack",
        version: this.version
      },
      data: packedString
    };
    return JSON.stringify(data);
  }

  unpack(raw: string): eventWithTime[] {
    const data: PackedData<string> = JSON.parse(raw);
    if (!data.meta || data.meta.packer !== "msgpack") {
      throw new Error("These events were not packed by the msgpack packer.");
    }
    if (data.meta.version !== this.version) {
      throw new Error(
        `These events were packed with version ${data.meta.version} which is incompatible with current version ${this.version}.`
      );
    }
    return decode(
      data.data.split(",").map(fragment => parseInt(fragment, 10))
    ) as eventWithTime[];
  }
}
