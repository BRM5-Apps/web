import type {
  ActionGraphDocument,
  ActionGraphEdge,
  ActionGraphEdgeKind,
  ActionGraphNode,
  ActionGraphTriggerNode,
  EventFilter,
  FlowAction,
  FaCheck,
  ConditionNode,
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

export function ensureTriggerNode(
  graph: ActionGraphDocument,
  triggerType: "TIME" | "EVENT" = "TIME",
  eventType?: string,
  cronExpression?: string,
): ActionGraphDocument {
  // If graph already has a trigger node, update it in place
  const existingTrigger = graph.nodes.find((n) => n.kind === "trigger");
  if (existingTrigger) {
    return {
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.id === existingTrigger.id
          ? {
              ...n,
              triggerType,
              eventType,
              cronExpression,
            } as ActionGraphTriggerNode
          : n,
      ),
    };
  }

  // Create a new trigger node
  const triggerNode: ActionGraphTriggerNode = {
    id: uid(),
    kind: "trigger",
    triggerType,
    eventType,
    cronExpression,
    filters: [],
  };

  return {
    ...graph,
    entry_node_id: triggerNode.id,
    nodes: [triggerNode, ...graph.nodes],
  };
}

export function upsertTriggerNode(
  graph: ActionGraphDocument,
  triggerType: "TIME" | "EVENT",
  eventType?: string,
  cronExpression?: string,
  timezone?: string,
  filters?: EventFilter[],
): ActionGraphDocument {
  const existingTrigger = graph.nodes.find((n) => n.kind === "trigger");
  if (existingTrigger) {
    return {
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.id === existingTrigger.id
          ? {
              ...n,
              kind: "trigger" as const,
              triggerType,
              eventType,
              cronExpression,
              timezone,
              filters,
            }
          : n,
      ),
    };
  }

  const triggerNode: ActionGraphTriggerNode = {
    id: uid(),
    kind: "trigger",
    triggerType,
    eventType,
    cronExpression,
    timezone,
    filters,
  };

  return {
    ...graph,
    entry_node_id: triggerNode.id,
    nodes: [triggerNode, ...graph.nodes],
  };
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

export function ensureActionGraph(
  actions: FlowAction[],
  graph?: ActionGraphDocument,
  options?: {
    triggerType?: "TIME" | "EVENT";
    eventType?: string;
    cronExpression?: string;
    skipTrigger?: boolean; // If true, don't create a trigger node (for button workflows)
  }
): ActionGraphDocument {
  if (graph && hasActionGraph(graph)) {
    return graph;
  }
  const newGraph = legacyFlowToGraph(actions);
  if (options?.skipTrigger) {
    return newGraph;
  }
  return ensureTriggerNode(newGraph, options?.triggerType ?? "TIME", options?.eventType, options?.cronExpression);
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

  // Skip the trigger node to find the first real action/condition node
  function skipTrigger(nodeId: string): string | undefined {
    const node = nodeMap.get(nodeId);
    if (!node) return undefined;
    if (node.kind !== "trigger") return nodeId;
    // Follow "next" edge from trigger node
    const edges: ActionGraphEdge[] = outgoing.get(nodeId) ?? [];
    const nextEdge = edges.find((e) => e.kind === "next");
    if (!nextEdge) return undefined;
    return skipTrigger(nextEdge.target);
  }

  const visiting = new Set<string>();
  const branchVisited = new Set<string>();

  function walkSequence(nodeId?: string): FlowAction[] | null {
    if (!nodeId) return [];
    if (visiting.has(nodeId)) return null;

    const skipped = skipTrigger(nodeId);
    if (!skipped) return [];

    const sequence: FlowAction[] = [];
    let currentId: string | undefined = skipped;

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

      if (node.kind === "trigger") {
        // Follow the "next" edge through the trigger
        const nextEdge = nextEdges[0];
        visiting.delete(currentId);
        currentId = nextEdge ? skipTrigger(nextEdge.target) : undefined;
        continue;
      }

      if (node.kind === "action") {
        if (passEdges.length > 0 || failEdges.length > 0 || nextEdges.length > 1) return null;
        sequence.push(node.action);
        visiting.delete(currentId);
        currentId = nextEdges[0] ? skipTrigger(nextEdges[0].target) : undefined;
        continue;
      }

      if (node.kind === "modal_field") {
        // Modal field nodes don't contribute to the legacy flow
        visiting.delete(currentId);
        currentId = nextEdges[0] ? skipTrigger(nextEdges[0].target) : undefined;
        continue;
      }

      // Handle condition nodes
      if (node.kind !== "condition") {
        visiting.delete(currentId);
        return null;
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
      currentId = nextEdges[0] ? skipTrigger(nextEdges[0].target) : undefined;
    }

    return sequence;
  }

  function walkBranch(startId?: string): FlowAction[] | null {
    if (!startId) return [];
    const skipped = skipTrigger(startId);
    if (!skipped) return [];
    const branchContext = new Set(branchVisited);
    const result = walkSequence(skipped);
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
