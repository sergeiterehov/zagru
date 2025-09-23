import { idToSql, tableToSql } from "@/utils/duck";
import { NodeImpl } from "@/utils/nodeTypes";
import { ZA } from "@/za";

export const startSelectionNode: NodeImpl<ZA.Nodes.Selection, string, { _: string; sql: string }> = async ({
  env,
  requiredOutput,
  input,
  node,
  state,
}) => {
  const { query } = node.props;

  const wrapTable = (name: string) => {
    console.log(name, input);
    if (name in input && typeof input[name] === "string" && node.props.refs?.includes(name)) {
      return tableToSql(input[name]);
    }

    return tableToSql(name);
  };

  const select_sql = `SELECT ${query.select.length === 0 ? "*" : ""}${query.select
    .map((s) => {
      let col_full = `${wrapTable(s.table)}.${idToSql(s.col)}`;

      if (s.agg && /^[a-zA-Z_]+[a-zA-Z_0-9]*$/.test(s.agg)) {
        col_full = `${s.agg}(${col_full})`;
      }

      return `${col_full} AS ${s.alias}`;
    })
    .join(", ")} FROM ${query.from
    .map((f) => {
      let from_full = wrapTable(f.table);

      if (f.join) {
        let join_type = "JOIN";

        if (f.join.type === "left") {
          join_type = "LEFT JOIN";
        } else if (f.join.type === "right") {
          join_type = "RIGHT JOIN";
        } else if (f.join.type === "inner") {
          join_type = "INNER JOIN";
        } else {
          throw new Error(`Unsupported join type`);
        }

        from_full = `${join_type} ${from_full}`;

        if (f.join.on) {
          from_full = `${from_full} ON ${wrapTable(f.table)}.${idToSql(f.join.on.col)} = ${wrapTable(
            f.join.on.ext_table
          )}.${idToSql(f.join.on.ext_col)}`;
        }
      }

      return from_full;
    })
    .join(" ")} LIMIT ${env.select_limit};`;

  if (requiredOutput.has("sql")) {
    state.output.sql = select_sql;
  }

  if (requiredOutput.has("_")) {
    const create_sql = `CREATE TABLE ${idToSql(node.id)} AS ${select_sql}`;

    const connection = await env.duck.connect();
    try {
      await connection.run(create_sql);
      state.output._ = node.id;
    } finally {
      connection.disconnectSync();
    }
  }
};
