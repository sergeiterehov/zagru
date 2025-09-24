import { selectorToSql } from "@/utils/duck";
import { NodeImpl } from "@/utils/nodeTypes";
import { ZA } from "@/za";

export const startDebugNode: NodeImpl<ZA.Nodes.DebugPrint, "_" | "sql", {}> = async ({
  node,
  input,
  env,
  state,
  signal,
}) => {
  if (typeof input._ === "string") {
    const connection = await env.duck.connect();

    try {
      const result = await connection.run(`SELECT * FROM ${selectorToSql(input._)} LIMIT ${env.select_limit};`);
      env.debug_print_results.push({ id: node.id, cols: result.columnNames(), rows: await result.getRowsJson() });
    } finally {
      connection.disconnectSync();
    }
  }

  if (typeof input.sql === "string") {
    env.debug_print_results.push({ id: node.id, cols: ["sql"], rows: input.sql });
  }
};
