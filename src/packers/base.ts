import { eventWithTime } from "rrweb/typings/types";

export abstract class Packer {
  version!: number;

  pack!: (events: eventWithTime[]) => string;
  unpack!: (raw: string) => eventWithTime[];
}

export type PackedData<T> = {
  meta: Meta;
  data: T;
};

export type Meta = {
  packer: string;
  version: number;
};
