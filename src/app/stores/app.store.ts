import { ZA } from "@/za";
import { createStore } from "zustand/vanilla";

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
          select: [],
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

  openEnvSettings(): void;
};

export const createAppStore = () => {
  return createStore<AppStore>()((set) => ({
    envSettingsOpened: false,
    space: initSpace,

    openEnvSettings() {
      set({ envSettingsOpened: true });
    },
  }));
};
