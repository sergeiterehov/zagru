import { SpaceImpl } from "@/space/SpaceImpl";

export async function POST(request: Request) {
  const res = await request.json();

  const spaceImpl = new SpaceImpl(res.space);
  try {
    await spaceImpl.init();
    const { debug_print_results } = await spaceImpl.start();

    return Response.json({
      ok: true,
      debug_print_results,
      states: Object.fromEntries(
        [...spaceImpl.nodesState.entries()].map(([id, state]) => [id, { status: state.status, error: state.error }])
      ),
    });
  } finally {
    spaceImpl.destroy();
  }
}
