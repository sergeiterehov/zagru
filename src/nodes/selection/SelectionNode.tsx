import { ZA } from "@/za";
import { Box } from "@chakra-ui/react";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export const SelectionNode = (props: NodeProps<Node<{ node: ZA.Nodes.Selection }>>) => {
  const { data, selected } = props;

  return (
    <>
      <Box
        css={{ fontWeight: 600, fontFamily: "monospace", padding: "5px" }}
        background={selected ? "bg.muted" : undefined}
        borderRadius="md"
      >
        SELECT
      </Box>
      {data.node.props.refs?.length && <Handle type="target" position={Position.Left} />}
      <Handle type="source" position={Position.Right} />
    </>
  );
};
