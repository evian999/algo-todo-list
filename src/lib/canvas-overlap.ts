import type { Node } from "@xyflow/react";

/** 与画布 TaskNode 估算占位一致（max-w 280 + padding） */
const TASK_W = 288;
const TASK_H = 140;
const GAP = 14;

function buildById(nodes: Node[]): Map<string, Node> {
  return new Map(nodes.map((n) => [n.id, n]));
}

function absolutePos(n: Node, byId: Map<string, Node>): { x: number; y: number } {
  if (!n.parentId) return { x: n.position.x, y: n.position.y };
  const p = byId.get(n.parentId);
  if (!p) return { x: n.position.x, y: n.position.y };
  const po = absolutePos(p, byId);
  return { x: n.position.x + po.x, y: n.position.y + po.y };
}

function setFromAbsolute(
  n: Node,
  abs: { x: number; y: number },
  byId: Map<string, Node>,
) {
  if (!n.parentId) {
    n.position = { x: abs.x, y: abs.y };
    return;
  }
  const p = byId.get(n.parentId);
  if (!p) {
    n.position = { x: abs.x, y: abs.y };
    return;
  }
  const po = absolutePos(p, byId);
  n.position = { x: abs.x - po.x, y: abs.y - po.y };
}

type TRect = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function overlaps(a: TRect, b: TRect): boolean {
  return !(
    a.x + a.w + GAP <= b.x ||
    b.x + b.w + GAP <= a.x ||
    a.y + a.h + GAP <= b.y ||
    b.y + b.h + GAP <= a.y
  );
}

/** 浅拷贝节点与 position，供就地调整 */
export function cloneNodesShallow(nodes: Node[]): Node[] {
  return nodes.map((n) => ({
    ...n,
    position: { ...n.position },
  }));
}

/**
 * 同一父节点下的任务节点若重叠，将靠后的节点向右或向下推开（迭代至无明显重叠）。
 */
export function separateOverlappingTaskNodes(nodes: Node[]): Node[] {
  const next = cloneNodesShallow(nodes);
  const byId = buildById(next);
  const tasks = next.filter((n) => n.type === "task");
  const byParent = new Map<string | undefined, Node[]>();
  for (const t of tasks) {
    const k = t.parentId;
    const arr = byParent.get(k) ?? [];
    arr.push(t);
    byParent.set(k, arr);
  }

  for (const [, group] of byParent) {
    if (group.length < 2) continue;
    for (let iter = 0; iter < 80; iter++) {
      let moved = false;
      const rects: TRect[] = group.map((t) => {
        const p = absolutePos(t, byId);
        return { id: t.id, x: p.x, y: p.y, w: TASK_W, h: TASK_H };
      });
      for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
          const A = rects[i];
          const B = rects[j];
          if (!overlaps(A, B)) continue;
          const nodeB = byId.get(B.id)!;
          const bAbs = { x: B.x, y: B.y };
          const overlapX =
            Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
          const overlapY =
            Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
          const newAbs =
            overlapX < overlapY
              ? { x: A.x + A.w + GAP, y: bAbs.y }
              : { x: bAbs.x, y: A.y + A.h + GAP };
          setFromAbsolute(nodeB, newAbs, byId);
          moved = true;
          rects[j] = {
            id: B.id,
            x: newAbs.x,
            y: newAbs.y,
            w: TASK_W,
            h: TASK_H,
          };
        }
      }
      if (!moved) break;
    }
  }

  return next;
}
