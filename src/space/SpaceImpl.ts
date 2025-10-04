import { DuckDBInstance } from "@duckdb/node-api";
import { ZA } from "@/za";
import { startDebugNode } from "@/nodes/debug/startDebugNode";
import { startSelectionNode } from "@/nodes/selection/startSelectionNode";
import { idToSql, strToSql } from "@/utils/duck";
import { NodeEnv, NodeImpl, NodeState } from "@/utils/nodeTypes";

const max_each_select = 1_000_000;

const implTypes: Record<ZA.Node["type"], NodeImpl<any, any, Record<string, unknown>>> = {
  debug_print: startDebugNode,
  selection: startSelectionNode,
};

export class SpaceImpl {
  private nodeById = new Map<ZA.ID, ZA.Node>();
  private _queue: ZA.Node[] = [];

  private _duck: Promise<DuckDBInstance>;

  private _controller = new AbortController();

  public nodesState = new Map<ZA.ID, NodeState>();

  constructor(public readonly space: ZA.Space) {
    this._duck = DuckDBInstance.create(":memory:");
  }

  public async destroy() {
    try {
      const duck = await this._duck;
      duck.closeSync();
    } catch (e) {}
  }

  private async _attachDatabases() {
    const { space } = this;

    const duck = await this._duck;
    const connection = await duck.connect();

    try {
      for (const db of space.env.dbs) {
        if (/[^a-zA-Z_0-9]/.test(db.alias)) throw new Error(`Unexpected DB alias symbol: ${db.alias}`);

        if (db.type === "sqlite") {
          await connection.run(`INSTALL sqlite; LOAD sqlite;`);
          await connection.run(`ATTACH ${strToSql(db.props.file)} AS ${idToSql(db.alias)} (TYPE sqlite);`);
        }
      }
    } finally {
      connection.disconnectSync();
    }
  }

  public async getSchemaInfo() {
    const duck = await this._duck;

    const connection = await duck.connect();
    try {
      await this._attachDatabases();

      const result = await connection.run(
        `SELECT database_name,schema_name,table_name,column_name,column_index,data_type,data_type_id FROM duckdb_columns;`
      );
      const tables = (await result.getRowObjectsJson()) as ZA.ColumnInfo[];

      return tables;
    } finally {
      connection.disconnectSync();
    }
  }

  public init() {
    const { space } = this;

    for (const node of space.nodes) this.nodeById.set(node.id, node);

    const initialized = new Set<ZA.Node>();
    const pool = new Set(space.nodes);
    for (let limit = 10_000; limit; limit -= 1) {
      if (limit <= 1) throw new Error(`Maximum iteration exited`);

      if (!pool.size) break;

      let progress = false;
      for (const node of pool) {
        let ready = true;
        for (const link of space.links) {
          if (link.b[0] !== node.id) continue;

          const source = this.nodeById.get(link.a[0]);

          if (!source) throw new Error(`Bad link: ${link.id}`);

          if (!initialized.has(source)) {
            ready = false;
            break;
          }
        }

        if (!ready) continue;

        const requiredOutput = new Set<string>();
        for (const link of this.space.links) {
          if (link.a[0] !== node.id) continue;
          requiredOutput.add(link.a[1]);
        }
        console.log(`${node.id}(${node.type}) -> ${[...requiredOutput].join(",")}`);

        this._queue.push(node);

        initialized.add(node);
        pool.delete(node);
        progress = true;
        break;
      }

      if (!progress) throw new Error(`Loop found`);
    }
  }

  public async start(): Promise<NodeEnv> {
    await this._attachDatabases();

    const duck = await this._duck;

    const env: NodeEnv = {
      duck,
      select_limit: max_each_select,
      debug_print_results: {},
    };

    for (const node of this._queue) {
      const startNode = implTypes[node.type];

      if (!startNode) throw new Error(`Node type ${node.type} is not implemented`);

      const input: Record<string, unknown> = {};
      for (const link of this.space.links) {
        if (link.b[0] !== node.id) continue;

        const source = this.nodeById.get(link.a[0]);
        if (!source) throw new Error(`Bad link: ${link.id}`);

        const sourceImpl = this.nodesState.get(source.id);
        if (!sourceImpl) throw new Error(`Implementation not found: ${link.id}`);

        input[link.b[1]] = sourceImpl.output[link.a[1]];
      }

      const requiredOutput = new Set<string>();
      for (const link of this.space.links) {
        if (link.a[0] !== node.id) continue;
        requiredOutput.add(link.a[1]);
      }

      const state: NodeState = { output: {}, status: "new" };
      this.nodesState.set(node.id, state);
      try {
        await startNode({ node, input, env, requiredOutput, state, signal: this._controller.signal });
      } catch (e) {
        state.error = String(e);
        break;
      } finally {
        state.status = "done";
      }
    }

    return env;
  }
}
