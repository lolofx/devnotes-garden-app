import { Injectable } from '@angular/core';

type NodeType =
  | 'actor'
  | 'command'
  | 'domainEvent'
  | 'policy'
  | 'readModel'
  | 'aggregate'
  | 'externalSystem'
  | 'hotspot';

const KEYWORD_TO_CLASS: Record<string, NodeType> = {
  actor: 'actor',
  command: 'command',
  event: 'domainEvent',
  policy: 'policy',
  readModel: 'readModel',
  aggregate: 'aggregate',
  externalSystem: 'externalSystem',
  hotspot: 'hotspot',
};

const CLASS_DEFS: Record<NodeType, string> = {
  actor: 'fill:#FFEB3B,stroke:#F9A825,color:#000',
  command: 'fill:#03A9F4,stroke:#01579B,color:#fff',
  domainEvent: 'fill:#FF9800,stroke:#E65100,color:#000',
  policy: 'fill:#9C27B0,stroke:#6A0080,color:#fff',
  readModel: 'fill:#8BC34A,stroke:#558B2F,color:#000',
  aggregate: 'fill:#FBC02D,stroke:#F57F17,color:#000',
  externalSystem: 'fill:#E91E63,stroke:#880E4F,color:#fff',
  hotspot: 'fill:#F44336,stroke:#B71C1C,color:#fff',
};

interface ParsedNode {
  id: string;
  label: string;
  type: NodeType;
}

@Injectable({ providedIn: 'root' })
export class EventStormingTransformer {
  transform(dsl: string): string {
    const nodes = this.parse(dsl);
    if (nodes.length === 0) return 'graph LR';

    const edges: string[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      if (!curr || !next) continue;
      edges.push(
        `  ${curr.id}[${curr.label}]:::${curr.type} --> ${next.id}[${next.label}]:::${next.type}`,
      );
    }
    const first = nodes[0];
    if (nodes.length === 1 && first) {
      edges.push(`  ${first.id}[${first.label}]:::${first.type}`);
    }

    const usedTypes = new Set(nodes.map((n) => n.type));
    const classDefs = [...usedTypes].map((t) => `  classDef ${t} ${CLASS_DEFS[t]}`);

    return ['graph LR', ...edges, ...classDefs].join('\n');
  }

  private parse(dsl: string): ParsedNode[] {
    return dsl
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const spaceIdx = line.indexOf(' ');
        const keyword = spaceIdx === -1 ? line : line.slice(0, spaceIdx);
        const rawLabel = spaceIdx === -1 ? '' : line.slice(spaceIdx + 1).trim();
        const label = rawLabel.replace(/^["']|["']$/g, '');
        const type = KEYWORD_TO_CLASS[keyword] ?? 'hotspot';
        return { id: `N${i}`, label, type };
      });
  }
}
