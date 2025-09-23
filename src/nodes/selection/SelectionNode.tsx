import { ZA } from "@/za";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export const SelectionNode = (props: NodeProps<Node<{ node: ZA.Nodes.Selection }>>) => {
  return (
    <>
      <div style={{ fontWeight: 600, fontFamily: "monospace", padding: 4 }}>SELECT</div>
      {props.data.node.props.refs?.length && <Handle type="target" position={Position.Left} />}
      <Handle type="source" position={Position.Right} />
    </>
  );
};
