import { EventType, IncrementalSource } from "rrweb";
import { NodeType } from "rrweb-snapshot";
import {
  eventWithTime,
  incrementalSnapshotEvent,
  mutationData
} from "rrweb/typings/types";
import { getSize } from "./size";

export function parse(str: string): eventWithTime[] {
  const events = JSON.parse(str);
  // try my best to get events array
  if (Array.isArray(events)) {
    return events;
  }
  const keys = Object.keys(events);
  if (keys.length === 1 && Array.isArray(events[keys[0]])) {
    return events[keys[0]];
  }
  throw new Error("Invalid events format.");
}

export function groupEventByType(
  events: eventWithTime[]
): Record<EventType, number> {
  const stats = {
    [EventType.DomContentLoaded]: 0,
    [EventType.Load]: 0,
    [EventType.Meta]: 0,
    [EventType.FullSnapshot]: 0,
    [EventType.IncrementalSnapshot]: 0,
    [EventType.Custom]: 0
  };

  for (const event of events) {
    stats[event.type] += getSize(event);
  }

  return stats;
}

export function groupIncrementalSnapshotBySource(
  events: incrementalSnapshotEvent[]
): Record<IncrementalSource, number> {
  const stats = {
    [IncrementalSource.Input]: 0,
    [IncrementalSource.MouseInteraction]: 0,
    [IncrementalSource.MouseMove]: 0,
    [IncrementalSource.Mutation]: 0,
    [IncrementalSource.Scroll]: 0,
    [IncrementalSource.TouchMove]: 0,
    [IncrementalSource.ViewportResize]: 0
  };

  for (const event of events) {
    stats[event.data.source] += getSize(event);
  }

  return stats;
}

export function groupMutationByType(
  mutations: mutationData[]
): Record<"text" | "attribute" | "remove" | "add", number> {
  const stats = {
    text: 0,
    attribute: 0,
    remove: 0,
    add: 0
  };

  const nodes = {
    [NodeType.CDATA]: 0,
    [NodeType.Comment]: 0,
    [NodeType.Document]: 0,
    [NodeType.DocumentType]: 0,
    [NodeType.Element]: 0,
    [NodeType.Text]: 0
  };

  for (const m of mutations) {
    stats.text += getSize(m.texts);
    stats.attribute += getSize(m.attributes);
    stats.remove += getSize(m.removes);
    stats.add += getSize(m.adds);

    for (const a of m.adds) {
      nodes[a.node.type] += getSize(a);
    }
  }

  return stats;
}
