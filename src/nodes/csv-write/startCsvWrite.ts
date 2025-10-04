import { selectorToSql, strToSql } from "@/utils/duck";
import { NodeImpl } from "@/utils/nodeTypes";
import { ZA } from "@/za";

export const startCsvWrite: NodeImpl<ZA.Nodes.CsvWrite, "_", { file: string }> = async ({
  node,
  state,
  input,
  env,
  requiredOutput,
}) => {
  if (typeof input._ === "string" && requiredOutput.has("file")) {
    const connection = await env.duck.connect();
    try {
      // FIXME: Сделать отдельную папку для сохранения файлов
      const filename = `output_${node.id.replaceAll(/[^a-z0-9_.-]+/i, "")}.csv`;

      await connection.run(
        `COPY (SELECT * FROM ${selectorToSql(input._)} LIMIT ${env.select_limit}) TO ${strToSql(filename)};`
      );

      state.output.file = filename;
    } finally {
      connection.disconnectSync();
    }
  }
};
