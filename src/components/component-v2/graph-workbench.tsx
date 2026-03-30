"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PanelLeft,
  Workflow,
  Link2,
  Save,
  Info,
} from "lucide-react";
import { ElementSidebar } from "@/components/elements/element-sidebar";
import { ComputationGraphEditor } from "./computation-graph-editor";
import { BindingsEditor } from "./bindings-editor";
import type {
  ActionGraphDocument,
  StatCardConfig,
  StatsCardBindingConfig,
} from "./types";

interface GraphWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graph?: ActionGraphDocument;
  bindings?: StatsCardBindingConfig;
  stats: StatCardConfig[];
  serverId?: string;
  onSave: (payload: {
    computation: ActionGraphDocument;
    bindings: StatsCardBindingConfig;
  }) => void;
}

export function GraphWorkbench({
  open,
  onOpenChange,
  graph,
  bindings,
  stats,
  serverId,
  onSave,
}: GraphWorkbenchProps) {
  const [tab, setTab] = useState<"computation" | "bindings">("computation");
  const [draftGraph, setDraftGraph] = useState<ActionGraphDocument>(
    graph ?? { version: 1, nodes: [], edges: [] }
  );
  const [draftBindings, setDraftBindings] = useState<StatsCardBindingConfig>(
    bindings ?? { stats: {} }
  );
  const [leftPanelOpen, setLeftPanelOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("graph-workbench-panel-open") !== "false";
    }
    return true;
  });

  // Persist panel state
  useEffect(() => {
    localStorage.setItem("graph-workbench-panel-open", String(leftPanelOpen));
  }, [leftPanelOpen]);

  // Reset draft when overlay opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraftGraph(graph ?? { version: 1, nodes: [], edges: [] });
      setDraftBindings(bindings ?? { stats: {} });
      setTab("computation");
    }
    onOpenChange(nextOpen);
  };

  function saveAndClose() {
    onSave({ computation: draftGraph, bindings: draftBindings });
    onOpenChange(false);
  }

  const nodeCount = draftGraph.nodes.length;
  const edgeCount = draftGraph.edges.length;
  const bindingCount = Object.keys(draftBindings.stats ?? {}).length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[98vw] h-[96vh] overflow-hidden p-0 border-none">
        <DialogTitle className="sr-only">Graph Workbench</DialogTitle>
        <div className="flex h-full flex-col bg-[#1e1f22] text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3f4147] px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Graph Workbench</h2>
              <p className="text-sm text-[#b5bac1]">
                Define computation steps and bind their outputs to stats
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Status pills */}
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <span className="text-[10px] text-[#80848E] bg-[#1E1F22] border border-[#3f4147] rounded-full px-2.5 py-1">
                  {nodeCount} node{nodeCount !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-[#80848E] bg-[#1E1F22] border border-[#3f4147] rounded-full px-2.5 py-1">
                  {edgeCount} edge{edgeCount !== 1 ? "s" : ""}
                </span>
                <span className="text-[10px] text-[#80848E] bg-[#1E1F22] border border-[#3f4147] rounded-full px-2.5 py-1">
                  {bindingCount} binding{bindingCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Tab switcher */}
              <div className="rounded-md border border-[#3f4147] bg-[#111214] p-1 flex">
                {(
                  [
                    { key: "computation" as const, label: "Computation", icon: Workflow },
                    { key: "bindings" as const, label: "Bindings", icon: Link2 },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded px-3 py-1.5 text-sm capitalize transition-colors",
                      tab === key
                        ? "bg-[#5865F2] text-white"
                        : "text-[#b5bac1] hover:text-white"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={saveAndClose}>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          </div>

          {/* Body — 3-column grid matching action workbench */}
          <div
            className="grid min-h-0 flex-1 gap-0"
            style={{
              gridTemplateColumns: leftPanelOpen
                ? "320px 1fr"
                : "48px 1fr",
            }}
          >
            {/* Left Panel — Element Sidebar */}
            <div className="min-h-0 border-r border-[#3f4147] bg-[#2b2d31] flex flex-col">
              <button
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="w-full h-10 flex items-center justify-center border-b border-[#3f4147] hover:bg-[#3f4147] transition-colors"
                title={leftPanelOpen ? "Hide elements panel" : "Show elements panel"}
              >
                <PanelLeft className={cn("w-5 h-5", !leftPanelOpen && "rotate-180")} />
              </button>
              {serverId && leftPanelOpen ? (
                <div className="flex-1 p-4 overflow-hidden">
                  <ElementSidebar serverId={serverId} className="h-full border-[#3f4147] bg-[#2b2d31]" />
                </div>
              ) : null}
            </div>

            {/* Center — Main Content */}
            <div className="min-h-0">
              {tab === "computation" ? (
                <div className="h-full">
                  <ComputationGraphEditor
                    graph={draftGraph}
                    onChange={setDraftGraph}
                    stats={stats}
                  />
                </div>
              ) : (
                <div className="h-full overflow-y-auto discord-scroll">
                  <div className="max-w-3xl mx-auto p-6">
                    {/* Info banner */}
                    <div className="flex items-start gap-3 rounded-lg bg-[#5865F2]/5 border border-[#5865F2]/20 p-4 mb-6">
                      <Info className="w-4 h-4 text-[#5865F2] shrink-0 mt-0.5" />
                      <div className="text-xs text-[#B5BAC1] leading-relaxed">
                        <p>
                          Map each stat to a data source. Use{" "}
                          <strong className="text-[#14b8a6]">Server Stat</strong>{" "}
                          for live server data,{" "}
                          <strong className="text-[#14b8a6]">Variable</strong> for
                          values computed in the Computation tab, or{" "}
                          <strong className="text-[#14b8a6]">Literal</strong> for
                          fixed values.
                        </p>
                      </div>
                    </div>
                    <BindingsEditor
                      stats={stats}
                      bindings={draftBindings}
                      onChange={setDraftBindings}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
