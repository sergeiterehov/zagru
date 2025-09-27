import { ZA } from "@/za";
import { enableMapSet, produce } from "immer";
import { createStore } from "zustand/vanilla";
import { getSqlPlan } from "../lib/actions";

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
          select: [{ table: "t", col: "brand_name", disabled: true }],
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
  space: ZA.Space;
  envSettingsOpened: boolean;
  selectedNodeIds: Set<ZA.ID>;

  _fetchExecSpace(): Promise<void>;

  setSpace(update: ZA.Space): void;
  setNode(id: ZA.ID, update: ZA.Node): void;
  openEnvSettings(): void;

  selectNode(id: ZA.ID): void;
  deselectNode(id: ZA.ID): void;
};

export const createAppStore = () => {
  return createStore<AppStore>()((set, get) => ({
    envSettingsOpened: false,
    space: initSpace,
    selectedNodeIds: new Set(),

    async _fetchExecSpace() {
      getSqlPlan({ space: get().space }).then(console.log, console.error);
    },

    setSpace(update) {
      set({ space: update });
    },

    setNode(id, update) {
      set(
        produce<AppStore>((prev) => {
          const index = prev.space.nodes.findIndex((n) => n.id === id);

          if (index === -1) return;

          prev.space.nodes[index] = update;
        })
      );

      get()._fetchExecSpace();
    },

    openEnvSettings() {
      set({ envSettingsOpened: true });
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
  }));
};
