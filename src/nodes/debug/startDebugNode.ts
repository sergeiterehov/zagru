import { selectorToSql } from "@/utils/duck";
import { NodeImpl } from "@/utils/nodeTypes";
import { ZA } from "@/za";

export const startDebugNode: NodeImpl<ZA.Nodes.DebugPrint, "_" | "sql" | "file", {}> = async ({
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
      env.print_table[node.id] = { cols: result.columnNames(), rows: await result.getRowsJson() };
    } finally {
      connection.disconnectSync();
    }
  }

  if (typeof input.sql === "string") {
    env.print_table[node.id] = { cols: ["sql"], rows: [[input.sql]] };
  }

  if (typeof input.file === "string") {
    env.print_table[node.id] = { cols: ["file"], rows: [[input.file]] };
  }
};
