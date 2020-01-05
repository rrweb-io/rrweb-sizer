import { EventType, IncrementalSource } from "rrweb";
import {
  parse,
  groupEventByType,
  groupIncrementalSnapshotBySource,
  groupMutationByType
} from "../../src/libs/analyze";
import { e1 } from "../__fixture__/";
import { incrementalSnapshotEvent, mutationData } from "rrweb/typings/types";

const e1Events = parse(e1.content);

describe("group event by type", () => {
  it("real world", () => {
    const events = e1Events;
    const stats = groupEventByType(events);
    expect(stats).toMatchInlineSnapshot(`
      Object {
        "0": 0,
        "1": 0,
        "2": 1542959,
        "3": 571793,
        "4": 108,
        "5": 0,
      }
    `);
  });
});

describe("group incremental snapshot by source", () => {
  it("real world", () => {
    const events = e1Events.filter(
      e => e.type === EventType.IncrementalSnapshot
    );
    const stats = groupIncrementalSnapshotBySource(
      events as incrementalSnapshotEvent[]
    );
    expect(stats).toMatchInlineSnapshot(`
      Object {
        "0": 513840,
        "1": 900,
        "2": 13965,
        "3": 22216,
        "4": 2592,
        "5": 0,
        "6": 18280,
      }
    `);
  });
});

describe("group mutation data by type", () => {
  it("real world", () => {
    const mutations = e1Events
      .filter(
        e =>
          e.type === EventType.IncrementalSnapshot &&
          e.data.source === IncrementalSource.Mutation
      )
      .map(e => e.data as mutationData);
    const stats = groupMutationByType(mutations);
    expect(stats).toMatchInlineSnapshot(`
      Object {
        "add": 504592,
        "attribute": 5127,
        "remove": 1916,
        "text": 147,
      }
    `);
  });
});
