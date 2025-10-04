import { ZA } from "@/za";
import { NodeMeta } from "../nodeUtils";
import { CsvWriteNode } from "./CsvWriteNode";
import { CsvWriteProps } from "./CsvWriteProps";

export const metaCsvWrite: NodeMeta<ZA.Nodes.CsvWrite> = {
  type: "csv_write",
  name: "Write CSV",
  getInputs(node) {
    return { _: { type: "table" } };
  },
  getOutputs(node) {
    return { file: { type: "file" } };
  },
  NodeComponent: CsvWriteNode,
  PropsComponent: CsvWriteProps,
};
