import { EventType, IncrementalSource, MouseInteractions } from "rrweb";
import { serializedNodeWithId, NodeType } from "rrweb-snapshot";
import { eventWithTime, event, incrementalData } from "rrweb/typings/types";
import { Packer, PackedData } from "./base";

type SimpleEvent =
  | {
      // type
      t: EventType.DomContentLoaded;
    }
  | {
      //type
      t: EventType.Load;
    }
  | {
      // type
      t: EventType.FullSnapshot;
      // data
      d: {
        // node
        n: SimpleNodeWithId;
        // initialOffset
        i: {
          // top
          t: number;
          //left
          l: number;
        };
      };
    }
  | {
      // type
      t: EventType.IncrementalSnapshot;
      // data
      d: SimpleIncrementalData;
    }
  | {
      // type
      t: EventType.Meta;
      // data
      d: {
        // href
        _h: string;
        // width
        w: number;
        // height
        h: number;
      };
    }
  | {
      // type
      t: EventType.Custom;
      // data
      d: {
        // type
        t: string;
        // payload
        p: unknown;
      };
    };

type SimpleEventWithTime = SimpleEvent & {
  // timestamp
  s: number;
};

type SimpleIncrementalData =
  | {
      // source
      s: IncrementalSource.Mutation;
      // texts
      t: {
        // id
        i: number;
        // value
        v?: string;
      }[];
      // attributes
      a: {
        // id
        i: number;
        // attributes
        a?: Record<string, string | null>;
      }[];
      // removes
      r: {
        // parentId
        p: number;
        // id
        i: number;
      }[];
      // adds
      _a: {
        // parentId
        p: number;
        // previousId
        _p?: number;
        // nextId
        n?: number;
        // node
        _n: SimpleNodeWithId;
      }[];
    }
  | {
      // source
      s: IncrementalSource.MouseMove | IncrementalSource.TouchMove;
      // positions
      p: {
        x: number;
        y: number;
        // id
        i: number;
        // timeOffset
        t: number;
      }[];
    }
  | {
      // source
      s: IncrementalSource.MouseInteraction;
      // type
      t: MouseInteractions;
      // id
      i: number;
      x: number;
      y: number;
    }
  | {
      // source
      s: IncrementalSource.Scroll;
      // id
      i: number;
      x: number;
      y: number;
    }
  | {
      // source
      s: IncrementalSource.ViewportResize;
      // width
      w: number;
      // height
      h: number;
    }
  | {
      // source
      s: IncrementalSource.Input;
      // id
      i: number;
      // text
      t: string;
      // isChecked
      _i?: boolean;
    };

type SimpleNode =
  | {
      // type
      t: NodeType.Document;
      // childNodes, set to undefined when array is empty
      c?: SimpleNodeWithId[];
    }
  | {
      // implicit type: DocumentType
      // name
      n: string;
      // publicId
      p: string;
      // systemId
      s: string;
    }
  | {
      // implicit type: Element
      // tagName
      ta: string;
      // attributes
      a?: Record<string, string | boolean>;
      // childNodes, set to undefined when array is empty
      c?: SimpleNodeWithId[];
      // isSVG
      _i?: true;
    }
  | {
      // implicit type: Text
      // textContent
      te: string;
      // isStyle
      _i?: true;
    }
  | {
      // type
      t: NodeType.CDATA;
      // omit empty textContent
    }
  | {
      // type
      t: NodeType.Comment;
      // textContent
      _t: string;
    };

type SimpleNodeWithId = SimpleNode & {
  i: number;
};

export class SimplePacker implements Packer {
  version = 1;

  pack(events: eventWithTime[]): string {
    const packedEvents: SimpleEventWithTime[] = events.map(e => ({
      s: e.timestamp,
      ...this.toSimpleEvent(e)
    }));
    const data: PackedData<SimpleEventWithTime[]> = {
      meta: {
        packer: "simple",
        version: this.version
      },
      data: packedEvents
    };
    return JSON.stringify(data);
  }

  unpack(raw: string): eventWithTime[] {
    const data: PackedData<SimpleEventWithTime[]> = JSON.parse(raw);
    if (!data.meta || data.meta.packer !== "simple") {
      throw new Error("These events were not packed by the simple packer.");
    }
    if (data.meta.version !== this.version) {
      throw new Error(
        `These events were packed with version ${data.meta.version} which is incompatible with current version ${this.version}.`
      );
    }
    return data.data.map(e => ({
      timestamp: e.s,
      ...this.toEvent(e)
    }));
  }

  toSimpleEvent(e: event): SimpleEvent {
    switch (e.type) {
      case EventType.DomContentLoaded:
      case EventType.Load:
        return {
          t: e.type
        };
      case EventType.FullSnapshot:
        return {
          t: e.type,
          d: {
            n: {
              i: e.data.node.id,
              ...this.toSimpleNode(e.data.node)
            },
            i: {
              t: e.data.initialOffset.top,
              l: e.data.initialOffset.left
            }
          }
        };
      case EventType.IncrementalSnapshot:
        return {
          t: e.type,
          d: this.toSimpleIncrementalData(e.data)
        };
      case EventType.Meta:
        return {
          t: e.type,
          d: {
            _h: e.data.href,
            w: e.data.width,
            h: e.data.height
          }
        };
      case EventType.Custom:
        return {
          t: e.type,
          d: {
            t: e.data.tag,
            p: e.data.payload
          }
        };
    }
  }

  toSimpleIncrementalData(d: incrementalData): SimpleIncrementalData {
    switch (d.source) {
      case IncrementalSource.Mutation:
        return {
          s: d.source,
          t: d.texts.map(t => ({
            i: t.id,
            v: this.nullToUndefined(t.value)
          })),
          a: d.attributes.map(a => {
            if (Object.keys(a.attributes).length === 0) {
              return {
                i: a.id
              };
            }
            return {
              i: a.id,
              a: a.attributes
            };
          }),
          r: d.removes.map(r => ({
            p: r.parentId,
            i: r.id
          })),
          _a: d.adds.map(a => ({
            p: a.parentId,
            _p: this.nullToUndefined(a.previousId),
            n: this.nullToUndefined(a.nextId),
            _n: {
              i: a.node.id,
              ...this.toSimpleNode(a.node)
            }
          }))
        };
      case IncrementalSource.MouseMove:
      case IncrementalSource.TouchMove:
        return {
          s: d.source,
          p: d.positions.map(p => ({
            x: p.x,
            y: p.y,
            i: p.id,
            t: p.timeOffset
          }))
        };
      case IncrementalSource.MouseInteraction:
        return {
          s: d.source,
          t: d.type,
          i: d.id,
          x: d.x,
          y: d.y
        };
      case IncrementalSource.Scroll:
        return {
          s: d.source,
          i: d.id,
          x: d.x,
          y: d.y
        };
      case IncrementalSource.ViewportResize:
        return {
          s: d.source,
          w: d.width,
          h: d.height
        };
      case IncrementalSource.Input:
        return {
          s: d.source,
          i: d.id,
          t: d.text,
          _i: d.isChecked ? true : undefined
        };
    }
  }

  toSimpleNode(n: serializedNodeWithId): SimpleNode {
    switch (n.type) {
      case NodeType.Document:
        return {
          t: n.type,
          c:
            n.childNodes.length === 0
              ? undefined
              : n.childNodes.map(c => ({
                  i: c.id,
                  ...this.toSimpleNode(c)
                }))
        };
      case NodeType.DocumentType:
        return {
          n: n.name,
          p: n.publicId,
          s: n.systemId
        };
      case NodeType.Element:
        return {
          ta: n.tagName,
          a: Object.keys(n.attributes).length === 0 ? undefined : n.attributes,
          c:
            n.childNodes.length === 0
              ? undefined
              : n.childNodes.map(c => ({
                  i: c.id,
                  ...this.toSimpleNode(c)
                })),
          _i: n.isSVG ? true : undefined
        };
      case NodeType.Text:
        return {
          te: n.textContent,
          _i: n.isStyle ? true : undefined
        };
      case NodeType.CDATA:
        return {
          t: NodeType.CDATA
        };
      case NodeType.Comment:
        return {
          t: NodeType.Comment,
          _t: n.textContent
        };
    }
  }

  toEvent(e: SimpleEvent): event {
    switch (e.t) {
      case EventType.DomContentLoaded:
      case EventType.Load:
        return {
          type: e.t,
          data: {}
        };
      case EventType.FullSnapshot:
        return {
          type: e.t,
          data: {
            node: this.toNode(e.d.n),
            initialOffset: {
              top: e.d.i.t,
              left: e.d.i.l
            }
          }
        };
      case EventType.IncrementalSnapshot:
        return {
          type: e.t,
          data: this.toIncrementalData(e.d)
        };
      case EventType.Meta:
        return {
          type: e.t,
          data: {
            href: e.d._h,
            width: e.d.w,
            height: e.d.h
          }
        };
      case EventType.Custom:
        return {
          type: e.t,
          data: {
            tag: e.d.t,
            payload: e.d.p
          }
        };
    }
  }

  toIncrementalData(d: SimpleIncrementalData): incrementalData {
    switch (d.s) {
      case IncrementalSource.Mutation:
        return {
          source: d.s,
          texts: d.t.map(t => ({
            id: t.i,
            value: this.undefinedToNull(t.v)
          })),
          attributes: d.a.map(a => ({
            id: a.i,
            attributes: a.a || {}
          })),
          removes: d.r.map(r => ({
            parentId: r.p,
            id: r.i
          })),
          adds: d._a.map(a => ({
            parentId: a.p,
            previousId: this.undefinedToNull(a._p),
            nextId: this.undefinedToNull(a.n),
            node: this.toNode(a._n)
          }))
        };
      case IncrementalSource.MouseMove:
      case IncrementalSource.TouchMove:
        return {
          source: d.s,
          positions: d.p.map(p => ({
            x: p.x,
            y: p.y,
            id: p.i,
            timeOffset: p.t
          }))
        };
      case IncrementalSource.MouseInteraction:
        return {
          source: d.s,
          type: d.t,
          id: d.i,
          x: d.x,
          y: d.y
        };
      case IncrementalSource.Scroll:
        return {
          source: d.s,
          id: d.i,
          x: d.x,
          y: d.y
        };
      case IncrementalSource.ViewportResize:
        return {
          source: d.s,
          width: d.w,
          height: d.h
        };
      case IncrementalSource.Input:
        return {
          source: d.s,
          id: d.i,
          text: d.t,
          isChecked: d._i ? true : false
        };
    }
  }

  toNode(n: SimpleNodeWithId): serializedNodeWithId {
    const { i } = n;
    if ("t" in n) {
      if (n.t === NodeType.Document) {
        return {
          id: i,
          type: n.t,
          childNodes: n.c ? n.c.map(c => this.toNode(c)) : []
        };
      }
      if (n.t === NodeType.CDATA) {
        return {
          id: i,
          type: n.t,
          textContent: ""
        };
      }
      if (n.t === NodeType.Comment) {
        return {
          id: i,
          type: n.t,
          textContent: n._t
        };
      }
    }
    if ("n" in n && "p" in n && "s" in n) {
      return {
        id: i,
        type: NodeType.DocumentType,
        name: n.n,
        publicId: n.p,
        systemId: n.s
      };
    }
    if ("ta" in n) {
      return {
        id: i,
        type: NodeType.Element,
        tagName: n.ta,
        attributes: n.a || {},
        childNodes: n.c?.map(c => this.toNode(c)) || [],
        isSVG: n._i ? true : undefined
      };
    }
    if ("te" in n) {
      return {
        id: i,
        type: NodeType.Text,
        textContent: n.te,
        isStyle: n._i ? true : undefined
      };
    }
    throw new Error(`Unknown simple node: ${JSON.stringify(n)}`);
  }

  nullToUndefined<T>(value: null | T): undefined | T {
    if (value === null) {
      return undefined;
    }
    return value;
  }

  undefinedToNull<T>(value: undefined | T): null | T {
    if (value === undefined) {
      return null;
    }
    return value;
  }
}
