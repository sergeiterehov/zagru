import { ZA } from "@/za";

export async function getSqlPlan(params: { space: ZA.Space }) {
  const { space } = params;

  return (await fetch("/api/space/run", { method: "post", body: JSON.stringify({ space }) })).json();
}
