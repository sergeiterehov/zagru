import { ZA } from "@/za";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export const DebugPrintNode = (props: NodeProps<Node<{ node: ZA.Nodes.DebugPrint }>>) => {
  return (
    <>
      <div style={{ fontFamily: "monospace", padding: 4 }}>print()</div>
      <Handle type="target" position={Position.Left} />
    </>
  );
};
