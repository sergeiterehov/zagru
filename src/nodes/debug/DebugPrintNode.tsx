import { ZA } from "@/za";
import { Box } from "@chakra-ui/react";
import { Handle, Node, NodeProps, Position } from "@xyflow/react";

export const DebugPrintNode = (props: NodeProps<Node<{ node: ZA.Nodes.DebugPrint }>>) => {
  const { data, selected } = props;

  return (
    <>
      <Box
        css={{ fontFamily: "monospace", padding: "5px" }}
        background={selected ? "bg.muted" : undefined}
        borderRadius="md"
      >
        print()
      </Box>
      <Handle type="target" position={Position.Left} />
    </>
  );
};
