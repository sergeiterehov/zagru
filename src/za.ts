export namespace ZA {
  export type ID = string;
  export type IDSelector = ID[];

  export type TableInfo = {
    database: string;
    schema: string;
    name: string;
    column_names: string[];
    column_types: string[];
    temporary: boolean;
  };

  export namespace DB {
    type DBBy<T extends string, P = unknown> = {
      id: ID;
      type: T;
      alias: string;
      props: P;
    };

    export type SQLite = DBBy<"sqlite", { file: string }>;

    export type Database = SQLite;
  }

  export namespace QB {
    export type AggregationType = "sum" | "max" | "min" | "avg" | "count";

    export type JoinType = "left" | "right" | "inner";
    export type JoinOn = { col: string; ext_table: string; ext_col: string };
    export type Join = { type: JoinType; on?: JoinOn };

    export type FromItem = {
      table: string;
      join?: Join;
    };

    export type SelectItem = {
      table: string;
      col: string;
      alias?: string;
      agg?: AggregationType;
      disabled?: boolean;
    };

    export type ValueItem =
      | { aka: "col"; table: string; col: string }
      | { aka: "const"; type: "string"; val: string }
      | { aka: "const"; type: "number"; val: number };

    export type WhereItem = { disabled?: boolean } & (
      | { aka: "or"; cases: WhereItem[][] }
      | {
          aka: "=" | ">" | "<" | "!=" | ">=" | "<=";
          left: ValueItem;
          right: ValueItem;
        }
      | { aka: "is null" | "is not null"; obj: ValueItem }
    );

    export type Query = {
      from: FromItem[];
      where: WhereItem & { aka: "or" };
      select: SelectItem[];
      order: [];
    };
  }

  export namespace Nodes {
    type _Define<_Type extends string, _Props = unknown> = {
      id: ID;
      type: _Type;
      props: _Props;
      ui?: { position: { x: number; y: number } };
    };

    export type DebugPrint = _Define<"debug_print", {}>;
    export type Selection = _Define<"selection", { query: QB.Query; refs?: string[] }>;

    export type Any = DebugPrint | Selection;
  }

  export type Node = Nodes.Any;

  export type Link = {
    id: ID;
    a: IDSelector;
    b: IDSelector;
  };

  export type Space = {
    env: {
      dbs: DB.Database[];
    };
    nodes: Node[];
    links: Link[];
  };
}
