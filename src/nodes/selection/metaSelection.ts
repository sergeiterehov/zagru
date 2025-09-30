import { ZA } from "@/za";
import { NodeMeta } from "../nodeUtils";
import { SelectionNode } from "./SelectionNode";
import { SelectionProps } from "./SelectionProps";

export const metaSelection: NodeMeta<ZA.Nodes.Selection> = {
  type: "selection",
  name: "Selection",

  getInputs: (node) => ({
    ...(node.props.refs && Object.fromEntries(node.props.refs?.map((r) => [r, { type: "table" }]))),
  }),
  getOutputs: () => ({
    _: { type: "table" },
    sql: { type: "sql" },
  }),

  NodeComponent: SelectionNode,
  PropsComponent: SelectionProps,
};
