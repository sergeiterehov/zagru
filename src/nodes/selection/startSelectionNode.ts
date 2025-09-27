import { idToSql, selectorToSql, strToSql } from "@/utils/duck";
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

  function wrapSelectorToSql(name: string) {
    const parts = name.split(".");

    if (parts[0] in input && typeof input[parts[0]] === "string" && node.props.refs?.includes(parts[0])) {
      parts[0] = input[parts[0]] as string;
    }

    return selectorToSql(parts.join("."));
  }

  function valueToSql(v: ZA.QB.ValueItem): string {
    if (v.aka === "const") {
      if (v.type === "number" && typeof v.val === "number") return `${v.val}`;
      if (v.type === "string" && typeof v.val === "string") return strToSql(v.val);

      throw new Error(`Unsupported const type`);
    }

    if (v.aka === "col") {
      return wrapSelectorToSql(`${v.table}.${v.col}`);
    }

    throw new Error(`Unsupported value type`);
  }

  function whereToSql(w: ZA.QB.WhereItem): string {
    if (w.aka === "or") {
      return w.cases
        .map((whereAnd) =>
          whereAnd
            .filter((wa) => !wa.disabled)
            .map(whereToSql)
            .filter(Boolean)
            .map((s) => `(${s})`)
            .join(" AND ")
        )
        .filter(Boolean)
        .join(" OR ");
    }

    if ("left" in w && /^>|<|>=|<=|=|!=$/.test(w.aka)) {
      return `${valueToSql(w.left)} ${w.aka} ${valueToSql(w.right)}`;
    }

    if ("obj" in w && /^is null|is not null$/.test(w.aka)) {
      return `${valueToSql(w.obj)} ${w.aka.toUpperCase()}`;
    }

    throw new Error(`Unsupported where structure`);
  }

  let selection_list_sql = query.select
    .filter((s) => !s.disabled)
    .map((s) => {
      let col_full = wrapSelectorToSql(`${s.table}.${s.col}`);

      if (s.agg && /^[a-zA-Z_]+[a-zA-Z_0-9]*$/.test(s.agg)) {
        col_full = `${s.agg}(${col_full})`;
      }

      if (s.alias) {
        col_full = `${col_full} AS ${s.alias}`;
      }

      return col_full;
    })
    .filter(Boolean)
    .join(", ");

  if (!selection_list_sql) {
    selection_list_sql = "*";
  }

  let select_sql = `SELECT ${selection_list_sql}`;

  if (query.from.length) {
    select_sql = `${select_sql} FROM ${query.from
      .map((f, i) => {
        let from_full = wrapSelectorToSql(f.table);

        if (i > 0 && f.join) {
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
            from_full = `${from_full} ON ${wrapSelectorToSql(`${f.table}.${f.join.on.col}`)} = ${wrapSelectorToSql(
              `${f.join.on.ext_table}.${f.join.on.ext_col}`
            )}`;
          } else {
            from_full = `NATURAL ${from_full}`;
          }
        } else {
          if (i > 0) {
            from_full = `, ${from_full}`;
          }
        }

        return from_full;
      })
      .join(" ")}`;
  }

  const where_sql = whereToSql(query.where);

  if (where_sql) {
    select_sql = `${select_sql} WHERE ${where_sql}`;
  }

  if (query.select.some((s) => s.agg)) {
    const group_by_sql = query.select
      .map((s) => {
        if (s.agg) return;

        return wrapSelectorToSql(`${s.table}.${s.col}`);
      })
      .filter(Boolean)
      .join(", ");

    if (group_by_sql) {
      select_sql = `${select_sql} GROUP BY ${group_by_sql}`;
    }
  }

  select_sql = `${select_sql} LIMIT ${env.select_limit};`;

  if (requiredOutput.has("sql")) {
    state.output.sql = select_sql;
  }

  if (requiredOutput.has("_")) {
    const create_table_sql = `CREATE TABLE ${idToSql(node.id)} AS ${select_sql}`;

    const connection = await env.duck.connect();
    try {
      await connection.run(create_table_sql);
      state.output._ = node.id;
    } finally {
      connection.disconnectSync();
    }
  }
};
