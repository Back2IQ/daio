// App 2: Governance Map Builder
// Visual builder for governance structures with nodes and edges

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  Users,
  Bell,
  Shield,
  GitBranch,
  MousePointer2,
  Info,
  RotateCcw,
} from "lucide-react";
import type { MapNode, MapEdge, GovernanceWarning } from "../../types";
import { ASSET_CATEGORY_LABELS, ROLE_TYPE_LABELS } from "../../types";

interface NodeType {
  type: MapNode["type"];
  label: string;
  icon: React.ReactNode;
  color: string;
}

const NODE_TYPES: NodeType[] = [
  { type: "asset", label: "Asset", icon: <Wallet className="w-4 h-4" />, color: "bg-blue-500" },
  { type: "role", label: "Role", icon: <Users className="w-4 h-4" />, color: "bg-green-500" },
  { type: "trigger", label: "Trigger", icon: <Bell className="w-4 h-4" />, color: "bg-amber-500" },
  { type: "policy", label: "Policy", icon: <Shield className="w-4 h-4" />, color: "bg-purple-500" },
  { type: "gate", label: "Gate", icon: <GitBranch className="w-4 h-4" />, color: "bg-cyan-500" },
];

const INITIAL_NODES: MapNode[] = [
  { id: "1", type: "asset", label: "Bitcoin Holdings", x: 100, y: 100, data: { value: 50000 } },
  { id: "2", type: "role", label: "Primary Executor", x: 300, y: 100, data: { type: "executor" } },
  { id: "3", type: "policy", label: "Transfer Policy", x: 500, y: 100, data: { quorum: 2 } },
];

const INITIAL_EDGES: MapEdge[] = [
  { id: "e1", from: "1", to: "2", label: "managed by" },
  { id: "e2", from: "2", to: "3", label: "executes" },
];

export function GovernanceMapBuilder() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<MapNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<MapEdge[]>(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);

  // Analysis
  const analyzeGovernance = useCallback((): GovernanceWarning[] => {
    const warnings: GovernanceWarning[] = [];

    // Check for orphaned assets
    const assetNodes = nodes.filter((n) => n.type === "asset");
    const connectedAssets = new Set(edges.map((e) => e.from));
    assetNodes.forEach((asset) => {
      if (!connectedAssets.has(asset.id)) {
        warnings.push({
          type: "orphaned-asset",
          message: `Asset "${asset.label}" has no assigned manager`,
          nodeId: asset.id,
        });
      }
    });

    // Check for unassigned roles
    const roleNodes = nodes.filter((n) => n.type === "role");
    const connectedRoles = new Set([...edges.map((e) => e.from), ...edges.map((e) => e.to)]);
    roleNodes.forEach((role) => {
      if (!connectedRoles.has(role.id)) {
        warnings.push({
          type: "unassigned-role",
          message: `Role "${role.label}" is not connected to any workflow`,
          nodeId: role.id,
        });
      }
    });

    // Check for single points of failure
    const policyNodes = nodes.filter((n) => n.type === "policy");
    policyNodes.forEach((policy) => {
      const incomingEdges = edges.filter((e) => e.to === policy.id);
      if (incomingEdges.length === 1) {
        const sourceNode = nodes.find((n) => n.id === incomingEdges[0].from);
        if (sourceNode?.type === "role") {
          warnings.push({
            type: "single-point-of-failure",
            message: `Policy "${policy.label}" depends on a single role`,
            nodeId: policy.id,
          });
        }
      }
    });

    // Check for policies without quorum
    policyNodes.forEach((policy) => {
      const quorum = policy.data?.quorum as number | undefined;
      if (!quorum || quorum < 2) {
        warnings.push({
          type: "no-quorum",
          message: `Policy "${policy.label}" lacks multi-signature/quorum requirement`,
          nodeId: policy.id,
        });
      }
    });

    return warnings;
  }, [nodes, edges]);

  const warnings = analyzeGovernance();
  const coverage = Math.max(0, 100 - warnings.length * 15);

  // Add node
  const addNode = (type: MapNode["type"]) => {
    const newNode: MapNode = {
      id: `node-${Date.now()}`,
      type,
      label: type === "asset" ? "New Asset" : type === "role" ? "New Role" : `New ${type}`,
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 100,
      data: {},
    };
    setNodes([...nodes, newNode]);
  };

  // Delete node
  const deleteNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.from !== id && e.to !== id));
    setSelectedNode(null);
  };

  // Update node
  const updateNode = (id: string, updates: Partial<MapNode>) => {
    setNodes(nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (isConnecting) {
      if (connectFrom && connectFrom !== nodeId) {
        // Create edge
        const newEdge: MapEdge = {
          id: `edge-${Date.now()}`,
          from: connectFrom,
          to: nodeId,
        };
        setEdges([...edges, newEdge]);
        setIsConnecting(false);
        setConnectFrom(null);
      }
      return;
    }

    setSelectedNode(nodeId);
    setDraggedNode(nodeId);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    updateNode(draggedNode, { x, y });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  // Start connecting
  const startConnect = (nodeId: string) => {
    setIsConnecting(true);
    setConnectFrom(nodeId);
  };

  // Cancel connecting
  const cancelConnect = () => {
    setIsConnecting(false);
    setConnectFrom(null);
  };

  // Reset
  const reset = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setSelectedNode(null);
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Toolbar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Nodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {NODE_TYPES.map((nt) => (
                <Button
                  key={nt.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode(nt.type)}
                >
                  <div className={`w-4 h-4 ${nt.color} rounded mr-2 flex items-center justify-center text-white`}>
                    {nt.icon}
                  </div>
                  {nt.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Governance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Governance Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{coverage}%</div>
              <Progress value={coverage} className="h-2 mb-4" />
              <div className="space-y-2">
                {warnings.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    No issues detected
                  </div>
                ) : (
                  warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-amber-600 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{w.message}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAudit(!showAudit)} className="flex-1">
              <Info className="w-4 h-4 mr-2" />
              Audit
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] relative overflow-hidden">
            <div
              ref={canvasRef}
              className="absolute inset-0 bg-slate-50 dark:bg-slate-900"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={() => {
                setSelectedNode(null);
                cancelConnect();
              }}
            >
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #94a3b8 1px, transparent 1px),
                    linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Edges */}
              <svg className="absolute inset-0 pointer-events-none">
                {edges.map((edge) => {
                  const fromNode = nodes.find((n) => n.id === edge.from);
                  const toNode = nodes.find((n) => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  return (
                    <g key={edge.id}>
                      <line
                        x1={fromNode.x + 40}
                        y1={fromNode.y + 20}
                        x2={toNode.x}
                        y2={toNode.y + 20}
                        stroke="#94a3b8"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
                  </marker>
                </defs>
              </svg>

              {/* Nodes */}
              {nodes.map((node) => {
                const nodeType = NODE_TYPES.find((nt) => nt.type === node.type)!;
                const isSelected = selectedNode === node.id;
                const isConnectSource = connectFrom === node.id;

                return (
                  <div
                    key={node.id}
                    className={`absolute cursor-pointer transition-shadow ${
                      isSelected ? "ring-2 ring-blue-500" : ""
                    } ${isConnectSource ? "ring-2 ring-green-500" : ""}`}
                    style={{ left: node.x, top: node.y }}
                    onMouseDown={(e) => handleMouseDown(e, node.id)}
                  >
                    <div
                      className={`flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border ${
                        isSelected ? "border-blue-500" : "border-slate-200"
                      }`}
                    >
                      <div className={`w-6 h-6 ${nodeType.color} rounded flex items-center justify-center text-white`}>
                        {nodeType.icon}
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">{node.label}</span>
                    </div>
                  </div>
                );
              })}

              {/* Connecting indicator */}
              {isConnecting && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
                  Click target node to connect
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Properties Panel */}
        <div>
          {selectedNodeData ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Node Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={selectedNodeData.label}
                    onChange={(e) => updateNode(selectedNodeData.id, { label: e.target.value })}
                  />
                </div>

                {selectedNodeData.type === "asset" && (
                  <div className="space-y-2">
                    <Label>Asset Category</Label>
                    <Select
                      value={(selectedNodeData.data?.category as string) || "crypto"}
                      onValueChange={(v) =>
                        updateNode(selectedNodeData.id, {
                          data: { ...selectedNodeData.data, category: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASSET_CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedNodeData.type === "role" && (
                  <div className="space-y-2">
                    <Label>Role Type</Label>
                    <Select
                      value={(selectedNodeData.data?.type as string) || "executor"}
                      onValueChange={(v) =>
                        updateNode(selectedNodeData.id, {
                          data: { ...selectedNodeData.data, type: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_TYPE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedNodeData.type === "policy" && (
                  <div className="space-y-2">
                    <Label>Quorum Required</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={(selectedNodeData.data?.quorum as number) || 1}
                      onChange={(e) =>
                        updateNode(selectedNodeData.id, {
                          data: { ...selectedNodeData.data, quorum: parseInt(e.target.value) },
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => startConnect(selectedNodeData.id)}
                    disabled={isConnecting}
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteNode(selectedNodeData.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">
                <MousePointer2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a node to edit properties</p>
                <p className="text-sm mt-2">Drag nodes to reposition</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Audit View */}
      {showAudit && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Audit View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Total Nodes</div>
                  <div className="text-2xl font-bold">{nodes.length}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Connections</div>
                  <div className="text-2xl font-bold">{edges.length}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-sm text-slate-500">Warnings</div>
                  <div className={`text-2xl font-bold ${warnings.length > 0 ? "text-amber-600" : "text-green-600"}`}>
                    {warnings.length}
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="w-5 h-5" />
                <AlertDescription>
                  This audit view shows the current state of your governance map.
                  Address all warnings to achieve full coverage.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
