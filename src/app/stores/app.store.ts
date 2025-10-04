import { ZA } from "@/za";
import { enableMapSet, produce } from "immer";
import { createStore } from "zustand/vanilla";
import { getSchema, runSpaceAction } from "../lib/actions";
import { NodeState } from "@/utils/nodeTypes";
import { DataType, NodeIO, NodeMeta } from "@/nodes/nodeUtils";

enableMapSet();

const initSpace: ZA.Space = {
  env: {
    dbs: [{ id: "db_1", alias: "car", type: "sqlite", props: { file: "car.db" } }],
  },
  nodes: [
    {
      id: "n_select_brands_models",
      type: "selection",
      props: {
        query: {
          from: [
            { table: "car.Brands" },
            {
              table: "car.Models",
              join: { type: "left", on: { col: "brand_id", ext_table: "car.Brands", ext_col: "brand_id" } },
            },
          ],
          where: {
            aka: "or",
            cases: [
              [
                {
                  aka: "=",
                  left: { aka: "col", table: "car.Brands", col: "brand_name" },
                  right: { aka: "const", type: "string", val: "Ferrari" },
                },
                {
                  aka: ">",
                  left: { aka: "col", table: "car.Brands", col: "brand_id" },
                  right: { aka: "const", type: "number", val: 0 },
                },
              ],
              [
                {
                  aka: "is not null",
                  obj: { aka: "col", table: "car.Brands", col: "brand_name" },
                  disabled: true,
                },
              ],
            ],
          },
          select: [],
          order: [],
        },
      },
      ui: { position: { x: -65, y: -1.5 } },
    },
    { id: "n_print", type: "debug_print", props: {}, ui: { position: { x: 29.5, y: 29 } } },
    { id: "n_print_2", type: "debug_print", props: {}, ui: { position: { x: 109.5, y: 0 } } },
    {
      id: "n_selection_2",
      type: "selection",
      props: {
        refs: ["t"],
        query: {
          from: [
            { table: "t" },
            {
              table: "car.Car_Options",
              join: { type: "left", on: { col: "model_id", ext_table: "t", ext_col: "model_id" } },
            },
          ],
          where: { aka: "or", cases: [] },
          select: [
            { table: "t", col: "brand_name" },
            { table: "car.Car_Options", col: "option_set_id", agg: "count" },
          ],
          order: [],
        },
      },
      ui: { position: { x: 28, y: -35.5 } },
    },
  ],
  links: [
    { id: "l_1", a: ["n_select_brands_models", "sql"], b: ["n_print", "sql"] },
    { id: "l_3", a: ["n_select_brands_models", "_"], b: ["n_selection_2", "t"] },
    { id: "l_2", a: ["n_selection_2", "_"], b: ["n_print_2", "_"] },
  ],
};

export type AppStore = {
  metaTypes: Map<string, NodeMeta>;

  space: ZA.Space;
  envSettingsOpened: boolean;
  selectedNodeIds: Set<ZA.ID>;
  selectedLinkId?: ZA.ID;
  executionResult?: Awaited<ReturnType<typeof runSpaceAction>>;
  columns?: ZA.ColumnInfo[];

  readonly actions: {
    begin(): Promise<void>;

    defineMeta(metaList: NodeMeta[]): void;

    setSpace(update: ZA.Space): void;
    setNode(id: ZA.ID, update: ZA.Node): void;
    setNodePositionById(id: ZA.ID, position: ZA.UI.Position): void;
    openEnvSettings(): void;

    fetchSchema(): Promise<void>;
    fetchStartSpace(): Promise<void>;

    selectLink(id?: ZA.ID): void;
    selectNode(id: ZA.ID): void;
    deselectNode(id: ZA.ID): void;

    connect(sourceId: ZA.ID, targetId: ZA.ID): void;
    disconnect(sourceId: ZA.ID, targetId: ZA.ID): void;
  };
};

export const createAppStore = () => {
  const initialState: Omit<AppStore, "actions"> = {
    metaTypes: new Map(),
    envSettingsOpened: false,
    space: initSpace,
    selectedNodeIds: new Set(),
  };

  return createStore<AppStore>()((set, get) => {
    const actions: AppStore["actions"] = {
      async begin() {
        await actions.fetchSchema();
        await actions.fetchStartSpace();
      },

      defineMeta(metaList) {
        const { metaTypes } = get();

        for (const meta of metaList) {
          metaTypes.set(meta.type, meta);
        }
      },

      setSpace(update) {
        set({ space: update });
      },

      async fetchSchema() {
        const { space } = get();

        set({ columns: undefined });

        const columns = await getSchema({ space });
        console.log(columns);

        set({ columns });
      },

      async fetchStartSpace() {
        set({ executionResult: undefined });

        try {
          const res = await runSpaceAction({ space: get().space });

          set({ executionResult: res });
        } catch (e) {
          console.error(e);
        }
      },

      setNode(id, update) {
        set(
          produce<AppStore>((prev) => {
            const index = prev.space.nodes.findIndex((n) => n.id === id);

            if (index === -1) return;

            prev.space.nodes[index] = update;
          })
        );

        actions.fetchStartSpace();
      },

      setNodePositionById(id, position) {
        set(
          produce<AppStore>((prev) => {
            const node = prev.space.nodes.find((n) => n.id === id);
            if (!node) throw new Error("Node not found");

            node.ui.position = position;
          })
        );
      },

      openEnvSettings() {
        set({ envSettingsOpened: true });
      },

      selectLink(id) {
        set({ selectedLinkId: id });
      },

      selectNode(id) {
        set(
          produce<AppStore>((prev) => {
            prev.selectedNodeIds.add(id);
          })
        );
      },

      deselectNode(id) {
        set(
          produce<AppStore>((prev) => {
            prev.selectedNodeIds.delete(id);
          })
        );
      },

      connect(sourceId, targetId) {
        const { space, metaTypes } = get();

        const source = space.nodes.find((n) => n.id === sourceId);
        if (!source) throw new Error("Source node not found");

        const target = space.nodes.find((n) => n.id === targetId);
        if (!target) throw new Error("Target node not found");

        const sourceMeta = metaTypes.get(source.type);
        if (!sourceMeta) throw new Error("Source meta not found");

        const targetMeta = metaTypes.get(target.type);
        if (!targetMeta) throw new Error("Target meta not found");

        const outputs = sourceMeta.getOutputs(source);
        const inputs = targetMeta.getInputs(target);

        let outputName: string | undefined;
        let inputName: string | undefined;

        const availableInputNames = new Set<string>(Object.keys(inputs));

        for (const link of space.links) {
          availableInputNames.delete(link.b[1]);
        }

        if ("_" in outputs && "_" in inputs && outputs._.type && inputs._.type) {
          console.log("Default connection!");

          outputName = "_";
          inputName = "_";
        }

        if (!inputName || !outputName) {
          for (const name of Object.keys(outputs)) {
            if (name in inputs && inputs[name].type === outputs[name].type && availableInputNames.has(name)) {
              console.log("Name-type matched connection!");

              outputName = name;
              inputName = name;

              break;
            }
          }
        }

        if (!inputName || !outputName) {
          for (const [_outputName, _output] of Object.entries(outputs)) {
            for (const [_inputName, _input] of Object.entries(inputs)) {
              if (_output.type === _input.type && availableInputNames.has(_inputName)) {
                console.log("Only type matched connection!");

                outputName = _outputName;
                inputName = _inputName;

                break;
              }
            }
          }
        }

        if (!inputName || !outputName) throw new Error("Connection not available");

        for (const link of space.links) {
          if (
            link.a[0] === source.id &&
            link.a[1] === outputName &&
            link.b[0] === target.id &&
            link.b[1] === inputName
          ) {
            throw new Error("Link already exists");
          }
        }

        set(
          produce<AppStore>((prev) => {
            const link: ZA.Link = {
              id: `${source.id}.${outputName}:${target.id}.${inputName}`,
              a: [source.id, outputName],
              b: [target.id, inputName],
            };

            prev.space.links.push(link);
          })
        );

        actions.fetchStartSpace();
      },

      disconnect(sourceId, targetId) {
        const { space } = get();

        const source = space.nodes.find((n) => n.id === sourceId);
        if (!source) throw new Error("Source node not found");

        const target = space.nodes.find((n) => n.id === targetId);
        if (!target) throw new Error("Target node not found");

        set(
          produce<AppStore>((prev) => {
            prev.space.links = prev.space.links.filter((l) => l.a[0] !== source.id || l.b[0] !== target.id);
          })
        );

        actions.fetchStartSpace();
      },
    };

    return {
      ...initialState,
      actions,
    };
  });
};
