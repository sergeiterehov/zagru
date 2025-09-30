import { ZA } from "@/za";
import { NodeMeta } from "../nodeUtils";
import { DebugPrintNode } from "./DebugPrintNode";
import { DebugPrintProps } from "./DebugPrintProps";

export const metaDebugPrint: NodeMeta<ZA.Nodes.DebugPrint> = {
  type: "debug_print",
  name: "Debug print",

  getInputs: () => ({
    _: { type: "table" },
    sql: { type: "sql" },
  }),
  getOutputs: () => ({}),

  NodeComponent: DebugPrintNode,
  PropsComponent: DebugPrintProps,
};
