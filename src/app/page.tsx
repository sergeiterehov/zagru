"use client";
import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap,
  Controls,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box } from "@chakra-ui/react";
import { ZA } from "@/za";
import { SelectionNode } from "@/nodes/selection/SelectionNode";
import { SelectionProps } from "@/nodes/selection/SelectionProps";
import { getSqlPlan } from "./lib/actions";
import { useAppStore } from "./app.store.context";
import { DebugPrintNode } from "@/nodes/debug/DebugPrintNode";

const nodeTypes = {
  debug_print: DebugPrintNode,
  selection: SelectionNode,
};

const nodePropTypes: {
  [K in ZA.Node["type"]]?: React.FC<{ node: ZA.Node & { type: K }; onChange(update: ZA.Node): void }>;
} = {
  selection: SelectionProps,
};

export default function Home() {
  const [nodes, setNodes] = useState<Node<{ node: ZA.Node }>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const activeNodeId = useAppStore((s) => s.activeNodeId);
  const zNodes = useAppStore((s) => s.space.nodes);
  const zLinks = useAppStore((s) => s.space.links);
  const setActiveNodeId = useAppStore((s) => s.setActiveNodeId);
  const setNode = useAppStore((s) => s.setNode);

  const activeNode = activeNodeId ? nodes.find((n) => n.data.node.id === activeNodeId) : undefined;

  useEffect(() => {
    const newNodes: Node<{ node: ZA.Node }>[] = [];
    const newEdges: Edge[] = [];

    for (const zn of zNodes) {
      newNodes.push({ id: zn.id, type: zn.type, data: { node: zn }, position: { x: 0, y: 0, ...zn.ui?.position } });
    }

    const groups = new Map<ZA.ID, Map<ZA.ID, ZA.Link[]>>();
    for (const zl of zLinks) {
      let aGroup = groups.get(zl.a[0]);
      if (!aGroup) {
        aGroup = new Map<ZA.ID, ZA.Link[]>();
        groups.set(zl.a[0], aGroup);
      }
      let bGroup = aGroup.get(zl.b[0]);
      if (!bGroup) {
        bGroup = [];
        aGroup.set(zl.b[0], bGroup);
      }
      bGroup.push(zl);
    }
    for (const [a, bs] of groups.entries()) {
      for (const [b, links] of bs.entries()) {
        newEdges.push({
          id: `${a}__${b}`,
          source: a,
          target: b,
          label:
            links
              .filter((zl) => zl.b[1] !== "_")
              .map((zl) => zl.b[1])
              .join(", ") || undefined,
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [zNodes, zLinks]);

  const onNodesChange = useCallback((changes: NodeChange<Node<{ node: ZA.Node }>>[]) => {
    for (const change of changes) {
      if (change.type === "select") {
        if (change.selected) {
          setActiveNodeId(change.id);
        }
      }
    }
  }, []);
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((edgesSnapshot) => addEdge(connection, edgesSnapshot)),
    []
  );

  const activeZNode = activeNode?.data.node;

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
      {activeZNode && (
        <Box
          p="4"
          bg="rgba(255,255,255,0.8)"
          backdropFilter="blur(12px)"
          borderRadius="lg"
          shadow="lg"
          css={{
            position: "absolute",
            top: 10,
            left: 10,
            width: 420,
            maxHeight: "calc(100vh - 2 * var(--chakra-spacing-10))",
            overflow: "hidden",
            overflowY: "auto",
          }}
          data-state="open"
          _open={{
            animationName: "fade-in, scale-in",
            animationDuration: "200ms",
          }}
          _closed={{
            animationName: "fade-out, scale-out",
            animationDuration: "120ms",
          }}
        >
          {(() => {
            const Props = nodePropTypes[activeZNode.type];

            if (!Props) return "Props is not implemented";

            return <Props node={activeZNode} onChange={(update) => setNode(update.id, update)} />;
          })()}
        </Box>
      )}
    </div>
  );
}
