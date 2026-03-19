import type {
  ActionGraphDocument,
  ActionGraphEdge,
  ActionGraphEdgeKind,
  ActionGraphNode,
  FlowAction,
  FaCheck,
} from "./types";

function uid() {
  return crypto.randomUUID();
}

interface BuildSequenceResult {
  entryNodeId?: string;
  exitNodeIds: string[];
}

export function hasActionGraph(value: unknown): value is ActionGraphDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return candidate.version === 1 && Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

export function legacyFlowToGraph(actions: FlowAction[]): ActionGraphDocument {
  const nodes: ActionGraphNode[] = [];
  const edges: ActionGraphEdge[] = [];

  function addEdge(source: string, target: string, kind: ActionGraphEdgeKind) {
    edges.push({ id: uid(), source, target, kind });
  }

  function buildSequence(sequence: FlowAction[]): BuildSequenceResult {
    let entryNodeId: string | undefined;
    let pendingNextSources: string[] = [];

    for (const action of sequence) {
      const nodeId = action.id || uid();
      if (!entryNodeId) entryNodeId = nodeId;

      if (action.type === "check") {
        nodes.push({
          id: nodeId,
          kind: "condition",
          condition: action.condition,
        });

        for (const source of pendingNextSources) {
          addEdge(source, nodeId, "next");
        }

        const pass = buildSequence(action.passBranch);
        const fail = buildSequence(action.failBranch);

        if (pass.entryNodeId) addEdge(nodeId, pass.entryNodeId, "pass");
        if (fail.entryNodeId) addEdge(nodeId, fail.entryNodeId, "fail");

        pendingNextSources = [
          ...(pass.exitNodeIds.length > 0 ? pass.exitNodeIds : [nodeId]),
          ...(fail.exitNodeIds.length > 0 ? fail.exitNodeIds : [nodeId]),
        ];
        continue;
      }

      nodes.push({
        id: nodeId,
        kind: "action",
        action,
      });

      for (const source of pendingNextSources) {
        addEdge(source, nodeId, "next");
      }

      pendingNextSources = [nodeId];
    }

    return {
      entryNodeId,
      exitNodeIds: pendingNextSources,
    };
  }

  const result = buildSequence(actions);
  return {
    version: 1,
    entry_node_id: result.entryNodeId,
    nodes,
    edges,
  };
}

export function ensureActionGraph(actions: FlowAction[], graph?: ActionGraphDocument): ActionGraphDocument {
  if (graph && hasActionGraph(graph)) {
    return graph;
  }
  return legacyFlowToGraph(actions);
}

export function actionGraphToLegacyFlow(graph?: ActionGraphDocument): FlowAction[] | null {
  if (!graph || !graph.entry_node_id) return [];

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const outgoing = new Map<string, ActionGraphEdge[]>();
  for (const edge of graph.edges) {
    const sourceEdges: ActionGraphEdge[] = outgoing.get(edge.source) ?? [];
    sourceEdges.push(edge);
    outgoing.set(edge.source, sourceEdges);
  }

  const visiting = new Set<string>();
  const branchVisited = new Set<string>();

  function walkSequence(nodeId?: string): FlowAction[] | null {
    if (!nodeId) return [];
    if (visiting.has(nodeId)) return null;

    const sequence: FlowAction[] = [];
    let currentId: string | undefined = nodeId;

    while (currentId) {
      if (branchVisited.has(currentId)) return null;
      const node = nodeMap.get(currentId);
      if (!node) return null;

      branchVisited.add(currentId);
      visiting.add(currentId);

      const edges: ActionGraphEdge[] = outgoing.get(currentId) ?? [];
      const nextEdges = edges.filter((edge) => edge.kind === "next");
      const passEdges = edges.filter((edge) => edge.kind === "pass");
      const failEdges = edges.filter((edge) => edge.kind === "fail");

      if (node.kind === "action") {
        if (passEdges.length > 0 || failEdges.length > 0 || nextEdges.length > 1) return null;
        sequence.push(node.action);
        visiting.delete(currentId);
        currentId = nextEdges[0]?.target;
        continue;
      }

      if (passEdges.length > 1 || failEdges.length > 1 || nextEdges.length > 1) return null;

      const passBranch = walkBranch(passEdges[0]?.target);
      const failBranch = walkBranch(failEdges[0]?.target);
      if (passBranch == null || failBranch == null) return null;

      const action: FaCheck = {
        id: currentId,
        type: "check",
        condition: node.condition,
        passBranch,
        failBranch,
      };

      sequence.push(action);
      visiting.delete(currentId);
      currentId = nextEdges[0]?.target;
    }

    return sequence;
  }

  function walkBranch(startId?: string): FlowAction[] | null {
    if (!startId) return [];
    const branchContext = new Set(branchVisited);
    const result = walkSequence(startId);
    branchVisited.clear();
    for (const id of branchContext) {
      branchVisited.add(id);
    }
    return result;
  }

  return walkSequence(graph.entry_node_id);
}

export function isLinearizableGraph(graph?: ActionGraphDocument) {
  return actionGraphToLegacyFlow(graph) !== null;
}
