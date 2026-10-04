// A single bundled atlas: three columns, two rows. Never generate on goal creation.
export const ISLAND_POSITIONS=['0% 0%','50% 0%','100% 0%','0% 100%','50% 100%','100% 100%'];
export function assignIsland(goals:ReadonlyArray<{island?:number}>):number {
  const counts=ISLAND_POSITIONS.map((_,island)=>goals.filter(goal=>goal.island===island).length);
  const minimum=Math.min(...counts);
  const choices=counts.flatMap((count,island)=>count===minimum?[island]:[]);
  return choices[Math.floor(Math.random()*choices.length)];
}
