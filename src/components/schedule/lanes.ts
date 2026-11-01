import type { Occurrence } from "@/lib/domain/schedule";

export type Placed = Occurrence & { lane: number; lanes: number };

/** Çakışan ders saatlerini yan yana şeritlere yerleştirir. */
export function placeLanes(items: Occurrence[]): Placed[] {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: Placed[] = [];
  let cluster: Placed[] = [];
  let clusterEnd = -1;
  const laneEnds: number[] = [];

  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.push({ ...c, lanes }));
    cluster = [];
    laneEnds.length = 0;
  };

  sorted.forEach((o) => {
    if (o.start >= clusterEnd && cluster.length) flush();
    let lane = laneEnds.findIndex((end) => end <= o.start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = o.end;
    cluster.push({ ...o, lane, lanes: 1 });
    clusterEnd = Math.max(clusterEnd, o.end);
  });
  if (cluster.length) flush();
  return out;
}
