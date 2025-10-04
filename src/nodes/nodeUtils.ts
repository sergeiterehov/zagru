import { ZA } from "@/za";
import { Node, NodeProps } from "@xyflow/react";

export type DataType = "table" | "sql" | "file";
export type NodeIO = { type: DataType };

export type PropsProps<N extends ZA.Node> = {
  node: N;
  state: unknown;
  onChange(update: ZA.Node): void;
};
export type FlowProps<N extends ZA.Node> = NodeProps<Node<{ node: N }>>;

export type NodeMeta<N extends ZA.Node = ZA.Node> = {
  type: N["type"];
  name: string;

  getInputs(node: N): Record<string, NodeIO>;
  getOutputs(node: N): Record<string, NodeIO>;

  NodeComponent: React.FC<FlowProps<N>>;
  PropsComponent: React.FC<PropsProps<N>>;
};
