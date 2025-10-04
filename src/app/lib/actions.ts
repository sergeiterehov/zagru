"use server";

import { SpaceImpl } from "@/space/SpaceImpl";
import { ZA } from "@/za";

export async function runSpaceAction(params: { space: ZA.Space }) {
  const { space } = params;

  const spaceImpl = new SpaceImpl(space);
  try {
    await spaceImpl.init();
    const { print_table } = await spaceImpl.start();

    return {
      ok: true,
      print_table,
      states: Object.fromEntries(
        [...spaceImpl.nodesState.entries()].map(([id, state]) => [
          id,
          { ...state, output: Object.fromEntries(Object.entries(state.output).map(([k, v]) => [k, String(v)])) },
        ])
      ),
    };
  } finally {
    spaceImpl.destroy();
  }
}

export async function getSchema(params: { space: ZA.Space }) {
  const { space } = params;

  const spaceImpl = new SpaceImpl(space);
  try {
    await spaceImpl.init();

    return await spaceImpl.getSchemaInfo();
  } finally {
    spaceImpl.destroy();
  }
}
