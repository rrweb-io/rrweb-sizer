import { deflate, inflate } from "pako";
import { eventWithTime } from "rrweb/typings/types";
import { Packer, PackedData } from "./base";

export class PakoPacker implements Packer {
  version = 1;

  pack(events: eventWithTime[]): string {
    const packedString = deflate(JSON.stringify(events), { to: "string" });
    const data: PackedData<string> = {
      meta: {
        packer: "pako",
        version: this.version
      },
      data: packedString
    };
    return JSON.stringify(data);
  }

  unpack(raw: string): eventWithTime[] {
    const data: PackedData<string> = JSON.parse(raw);
    if (!data.meta || data.meta.packer !== "pako") {
      throw new Error("These events were not packed by the pako packer.");
    }
    if (data.meta.version !== this.version) {
      throw new Error(
        `These events were packed with version ${data.meta.version} which is incompatible with current version ${this.version}.`
      );
    }
    return JSON.parse(inflate(data.data, { to: "string" }));
  }
}
