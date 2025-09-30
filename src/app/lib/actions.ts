"use server";

import { SpaceImpl } from "@/space/SpaceImpl";
import { ZA } from "@/za";

export async function runSpaceAction(params: { space: ZA.Space }) {
  const { space } = params;

  const spaceImpl = new SpaceImpl(space);
  try {
    await spaceImpl.init();
    const { debug_print_results } = await spaceImpl.start();

    return {
      ok: true,
      debug_print_results,
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
