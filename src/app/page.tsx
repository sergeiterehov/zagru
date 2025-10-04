"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Box, HStack, Tabs } from "@chakra-ui/react";
import { ZA } from "@/za";
import { useAppStore } from "./app.store.context";
import { produce } from "immer";
import { NodeResults } from "./components/Results";
import { SpaceProps } from "./components/SpaceProps";
import { MainActionsBar } from "./components/MainActionsBar";

export default function Home() {
  const [nodes, setNodes] = useState<Node<{ node: ZA.Node }>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const actions = useAppStore((s) => s.actions);
  const metaTypes = useAppStore((s) => s.metaTypes);
  const selectedLinkId = useAppStore((s) => s.selectedLinkId);
  const selectedNodeIds = useAppStore((s) => s.selectedNodeIds);
  const zNodes = useAppStore((s) => s.space.nodes);
  const zLinks = useAppStore((s) => s.space.links);

  const activeZNode = useAppStore((s) => s.space.nodes.find((n) => s.selectedNodeIds.has(n.id)));

  // Initial fetch
  useEffect(() => {
    actions.begin();
  }, []);

  // Crating nodes and edges
  useEffect(() => {
    const newNodes: Node<{ node: ZA.Node }>[] = [];
    const newEdges: Edge[] = [];

    for (const zn of zNodes) {
      newNodes.push({
        id: zn.id,
        type: zn.type,
        data: { node: zn },
        position: { ...zn.ui.position },
      });
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
          id: `${a}:${b}`,
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

  // Sync selected node
  useEffect(() => {
    setNodes(
      produce((prev) => {
        for (const node of prev) {
          node.selected = selectedNodeIds.has(node.id);
        }
      })
    );
  }, [zNodes, selectedNodeIds]);

  // Sync selected edge
  useEffect(() => {
    setEdges(
      produce((prev) => {
        for (const edge of prev) {
          edge.selected = selectedLinkId === edge.id;
        }
      })
    );
  }, [zLinks, selectedLinkId]);

  const onNodesChange = useCallback((changes: NodeChange<Node<{ node: ZA.Node }>>[]) => {
    setNodes((prev) =>
      applyNodeChanges(
        changes.filter((c) => c.type === "position" || c.type === "dimensions"),
        prev
      )
    );

    for (const change of changes) {
      if (change.type === "select") {
        if (change.selected) {
          actions.selectNode(change.id);
        } else {
          actions.deselectNode(change.id);
        }
      } else if (change.type === "position" && !change.dragging && change.position) {
        actions.setNodePositionById(change.id, change.position);
      } else if (change.type === "remove") {
        actions.deleteNode(change.id);
      }
    }
  }, []);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === "remove") {
          const edge = edges.find((e) => e.id === change.id);
          if (!edge) throw new Error("Edge not found");

          actions.disconnect(edge.source, edge.target);
        } else if (change.type === "select") {
          const edge = edges.find((e) => e.id === change.id);
          if (!edge) throw new Error("Edge not found");

          actions.selectLink(change.selected ? edge.id : undefined);
        }
      }
    },
    [edges]
  );

  const onConnect = useCallback((connection: Connection) => {
    actions.connect(connection.source, connection.target);
  }, []);

  const nodeTypes = useMemo(
    () => Object.fromEntries(Array.from(metaTypes.values()).map((meta) => [meta.type, meta.NodeComponent])),
    [metaTypes]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ReactFlow
        fitView
        attributionPosition="bottom-left"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <MiniMap />
        <Controls />
      </ReactFlow>
      <MainActionsBar />
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
            width: 380,
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
            const metaType = metaTypes.get(activeZNode.type);
            if (!metaType) return "Meta not found";

            return (
              <metaType.PropsComponent
                state={undefined}
                node={activeZNode}
                onChange={(update) => actions.setNode(update.id, update)}
              />
            );
          })()}
        </Box>
      )}
      <Box
        p="4"
        bg="rgba(255,255,255,0.8)"
        backdropFilter="blur(12px)"
        borderRadius="lg"
        shadow="lg"
        css={{
          position: "absolute",
          top: 10,
          right: 10,
          maxWidth: 420,
          maxHeight: "calc(100vh - 2 * var(--chakra-spacing-10))",
          overflow: "hidden",
          overflowY: "auto",
        }}
      >
        <Tabs.Root lazyMount unmountOnExit defaultValue="results" variant="plain">
          <HStack width="full" justifyContent="flex-end">
            <Tabs.List bg="bg.muted" rounded="l3" p="1">
              <Tabs.Trigger value="results">Results</Tabs.Trigger>
              <Tabs.Trigger value="space">Space</Tabs.Trigger>
              <Tabs.Trigger value="select">Hide</Tabs.Trigger>
              <Tabs.Indicator rounded="l2" />
            </Tabs.List>
          </HStack>

          <Tabs.Content value="results">
            {activeZNode ? <NodeResults node={activeZNode} /> : "Select any node"}
          </Tabs.Content>
          <Tabs.Content value="space" m="0" p="0">
            <SpaceProps />
          </Tabs.Content>
          <Tabs.Content value="hide" m="0" p="0"></Tabs.Content>
        </Tabs.Root>
      </Box>
    </div>
  );
}
