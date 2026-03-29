/**
 * Modal Settings Sync
 *
 * This module provides bidirectional synchronization between the simple modal settings
 * (role assignments, output channels) and the advanced action graph representation.
 *
 * Changes in simple settings are reflected in the action graph and vice versa.
 */

import { FlowAction, ActionGraphDocument, ActionGraphActionNode, ActionGraphModalFieldNode, ActionGraphEdge, ActionGraphNode, ModalSettings } from "../component-v2/types";

// Generate a unique ID
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Convert modal settings to action graph nodes.
 * This creates a linear flow of actions from the settings.
 */
export function settingsToActions(settings: ModalSettings): FlowAction[] {
  const actions: FlowAction[] = [];

  // Role assignments become add_role actions
  settings.roleAssignments?.forEach((roleId) => {
    actions.push({
      id: uid(),
      type: "add_role",
      roleIds: [roleId],
    });
  });

  // Role removals become remove_role actions
  settings.roleRemovals?.forEach((roleId) => {
    actions.push({
      id: uid(),
      type: "remove_role",
      roleIds: [roleId],
    });
  });

  // Output channels become send_to_channel actions
  settings.outputChannels?.forEach((channelId) => {
    actions.push({
      id: uid(),
      type: "send_to_channel",
      channelId,
    } as FlowAction);
  });

  return actions;
}

/**
 * Convert action graph back to simple settings.
 * Extracts role assignments and output channels from the graph.
 */
export function actionsToSettings(actions: FlowAction[]): ModalSettings {
  const settings: ModalSettings = {
    roleAssignments: [],
    roleRemovals: [],
    outputChannels: [],
  };

  actions.forEach((action) => {
    if (action.type === "add_role") {
      settings.roleAssignments?.push(...(action as FlowAction & { roleIds: string[] }).roleIds);
    }
    if (action.type === "remove_role") {
      settings.roleRemovals?.push(...(action as FlowAction & { roleIds: string[] }).roleIds);
    }
    if (action.type === "send_to_channel") {
      const channelAction = action as FlowAction & { channelId: string };
      if (channelAction.channelId) {
        settings.outputChannels?.push(channelAction.channelId);
      }
    }
  });

  // Remove duplicates
  settings.roleAssignments = [...new Set(settings.roleAssignments)];
  settings.roleRemovals = [...new Set(settings.roleRemovals)];
  settings.outputChannels = [...new Set(settings.outputChannels)];

  return settings;
}

/**
 * Create a default action graph for a modal with field nodes.
 * Creates a flow: Start → Field 1 → Field 2 → ... → Field N → Submit
 * Start is a do_nothing action node, fields are modal_field nodes, submit is a do_nothing action node.
 */
export function createDefaultModalGraph(
  fields: Array<{ id: string; label: string; type: string; required: boolean }>
): { graph: ActionGraphDocument; fieldNodes: Record<string, string> } {
  const nodes: ActionGraphNode[] = [];
  const edges: ActionGraphEdge[] = [];
  const fieldNodes: Record<string, string> = {};

  // Create the start node - do_nothing action as entry point
  const startId = uid();
  const startNode: ActionGraphActionNode = {
    id: startId,
    kind: "action",
    action: {
      id: uid(),
      type: "do_nothing",
    },
    position: { x: 100, y: 50 },
  };
  nodes.push(startNode);

  let yPosition = 280; // More spacing after start node
  let prevNodeId = startId;

  // Create field nodes connected in sequence
  fields.forEach((field, index) => {
    const nodeId = uid();
    fieldNodes[field.id] = nodeId;

    const fieldNode: ActionGraphModalFieldNode = {
      id: nodeId,
      kind: "modal_field",
      fieldId: field.id,
      fieldLabel: field.label || `Field ${index + 1}`,
      fieldType: field.type as any,
      isRequired: field.required,
      position: { x: 100, y: yPosition },
    };
    nodes.push(fieldNode);

    // Connect previous node to this field
    edges.push({
      id: uid(),
      source: prevNodeId,
      target: nodeId,
      kind: "next",
    });

    prevNodeId = nodeId;
    yPosition += 220; // Increased spacing between fields for better readability
  });

  // Create the submit node - final do_nothing action node
  const submitId = uid();
  const submitNode: ActionGraphActionNode = {
    id: submitId,
    kind: "action",
    action: {
      id: uid(),
      type: "do_nothing",
    },
    position: { x: 100, y: yPosition },
  };
  nodes.push(submitNode);

  // Connect last field (or start if no fields) to submit
  edges.push({
    id: uid(),
    source: prevNodeId,
    target: submitId,
    kind: "next",
  });

  return {
    graph: {
      version: 1,
      entry_node_id: startId,
      nodes,
      edges,
    },
    fieldNodes,
  };
}

/**
 * Get actions attached to a specific field node.
 * Returns all action nodes that are directly connected from the field node.
 */
export function getFieldActions(
  graph: ActionGraphDocument,
  fieldNodeId: string
): FlowAction[] {
  const actions: FlowAction[] = [];
  const visited = new Set<string>();

  const collectActions = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    // Find all edges from this node
    const outgoingEdges = graph.edges.filter((e) => e.source === nodeId);

    for (const edge of outgoingEdges) {
      const targetNode = graph.nodes.find((n) => n.id === edge.target);
      if (targetNode?.kind === "action") {
        const actionNode = targetNode as ActionGraphActionNode;
        actions.push(actionNode.action);
      }
      // Continue traversing for connected nodes
      collectActions(edge.target);
    }
  };

  collectActions(fieldNodeId);
  return actions;
}

/**
 * Attach an action to a field node in the graph.
 * Creates a new action node and connects it to the field node.
 */
export function attachActionToField(
  graph: ActionGraphDocument,
  fieldNodeId: string,
  action: FlowAction
): ActionGraphDocument {
  const actionNodeId = uid();
  const actionNode: ActionGraphActionNode = {
    id: actionNodeId,
    kind: "action",
    action,
    position: { x: 300, y: 50 }, // Default position, can be adjusted
  };

  const edge: ActionGraphEdge = {
    id: uid(),
    source: fieldNodeId,
    target: actionNodeId,
    kind: "next",
  };

  return {
    ...graph,
    nodes: [...graph.nodes, actionNode],
    edges: [...graph.edges, edge],
  };
}

/**
 * Remove an action from the graph by its ID.
 * Also removes any edges connected to it.
 */
export function removeActionFromGraph(
  graph: ActionGraphDocument,
  actionId: string
): ActionGraphDocument {
  return {
    ...graph,
    nodes: graph.nodes.filter((n) => n.id !== actionId),
    edges: graph.edges.filter((e) => e.source !== actionId && e.target !== actionId),
  };
}

/**
 * Sync settings changes to the action graph.
 * When a user changes settings in the simple UI, this updates the graph accordingly.
 */
export function syncSettingsToGraph(
  graph: ActionGraphDocument,
  settings: ModalSettings,
  fieldNodeForSettings: string = "settings-node" // Virtual node ID for settings
): ActionGraphDocument {
  // Find the virtual settings node or create one
  let settingsNode = graph.nodes.find((n) => n.id === fieldNodeForSettings);
  let updatedGraph = { ...graph };

  if (!settingsNode) {
    // Create a virtual settings node
    settingsNode = {
      id: fieldNodeForSettings,
      kind: "modal_field",
      fieldId: "settings",
      fieldLabel: "Settings",
      fieldType: "text-display",
      isRequired: false,
      position: { x: -100, y: -100 }, // Off-canvas position
    } as ActionGraphModalFieldNode;
    updatedGraph = {
      ...updatedGraph,
      nodes: [...updatedGraph.nodes, settingsNode],
    };
  }

  // Remove existing actions from settings node
  const existingEdges = updatedGraph.edges.filter((e) => e.source === fieldNodeForSettings);
  const existingActionIds = existingEdges.map((e) => e.target);
  updatedGraph = {
    ...updatedGraph,
    nodes: updatedGraph.nodes.filter((n) => !existingActionIds.includes(n.id)),
    edges: updatedGraph.edges.filter((e) => e.source !== fieldNodeForSettings),
  };

  // Add new actions from settings
  const actions = settingsToActions(settings);
  let yPosition = 50;

  actions.forEach((action) => {
    const actionId = uid();
    const actionNode: ActionGraphActionNode = {
      id: actionId,
      kind: "action",
      action,
      position: { x: 100, y: yPosition },
    };

    const edge: ActionGraphEdge = {
      id: uid(),
      source: fieldNodeForSettings,
      target: actionId,
      kind: "next",
    };

    updatedGraph = {
      ...updatedGraph,
      nodes: [...updatedGraph.nodes, actionNode],
      edges: [...updatedGraph.edges, edge],
    };

    yPosition += 80;
  });

  return updatedGraph;
}

/**
 * Check if the graph has any field nodes (not just the virtual settings node).
 */
export function hasFieldNodes(graph: ActionGraphDocument): boolean {
  return graph.nodes.some(
    (n) => n.kind === "modal_field" && (n as ActionGraphModalFieldNode).fieldId !== "settings"
  );
}

/**
 * Get all field nodes from the graph.
 */
export function getFieldNodes(graph: ActionGraphDocument): ActionGraphModalFieldNode[] {
  return graph.nodes
    .filter((n) => n.kind === "modal_field")
    .map((n) => n as ActionGraphModalFieldNode);
}

/**
 * Update field node positions for layout purposes.
 */
export function updateFieldNodePositions(
  graph: ActionGraphDocument,
  positions: Record<string, { x: number; y: number }>
): ActionGraphDocument {
  return {
    ...graph,
    nodes: graph.nodes.map((node) => {
      if (node.kind === "modal_field" && positions[node.id]) {
        return {
          ...node,
          position: positions[node.id],
        };
      }
      return node;
    }),
  };
}