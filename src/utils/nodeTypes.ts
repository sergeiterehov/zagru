import { ZA } from "@/za";
import { DuckDBInstance } from "@duckdb/node-api";

export type NodeEnv = {
  duck: DuckDBInstance;
  select_limit: number;
  debug_print_results: { id: ZA.ID; cols: unknown; rows: unknown }[];
};

export type NodeState = {
  output: Record<string, unknown>;
  status: "new" | "working" | "done";
  error?: string;
};

export type NodeImpl<
  _Node extends ZA.Node = ZA.Node,
  _Input extends string = never,
  _Output extends object = Record<string, unknown>
> = (config: {
  node: _Node;
  input: Record<_Input, unknown>;
  requiredOutput: Set<keyof _Output>;
  env: NodeEnv;
  state: NodeState;
  signal: AbortSignal;
}) => Promise<void>;
