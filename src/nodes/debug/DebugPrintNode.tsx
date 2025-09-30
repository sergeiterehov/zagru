import { ZA } from "@/za";
import { Box } from "@chakra-ui/react";
import { Handle, Position } from "@xyflow/react";
import { FlowProps } from "../nodeUtils";

export const DebugPrintNode = (props: FlowProps<ZA.Nodes.DebugPrint>) => {
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
