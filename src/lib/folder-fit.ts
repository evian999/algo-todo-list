import type { Node } from "@xyflow/react";
import type { LayoutState, Rect, Task, TaskGroup } from "./types";
import { taskFolderKey } from "./types";

/** 与 TaskNode max-w 280px + 边距对齐的估算包裹宽 */
const TASK_NODE_BOUNDS_W = 300;
/** 含标题、标签、结果等时的保守高度 */
const TASK_NODE_BOUNDS_H = 200;
const FOLDER_CONTENT_PAD = 18;

function parseCssNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace("px", ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** 从 React Flow 节点读取当前宽高（拖拽/缩放后） */
export function readFlowNodeSize(n: Node): { w: number; h: number } | null {
  const mw = n.measured?.width;
  const mh = n.measured?.height;
  if (
    typeof mw === "number" &&
    typeof mh === "number" &&
    mw > 0 &&
    mh > 0
  ) {
    return { w: mw, h: mh };
  }
  const w =
    (typeof n.width === "number" && n.width > 0 ? n.width : undefined) ??
    parseCssNumber(n.style?.width);
  const h =
    (typeof n.height === "number" && n.height > 0 ? n.height : undefined) ??
    parseCssNumber(n.style?.height);
  if (w !== undefined && h !== undefined && w > 0 && h > 0) {
    return { w, h };
  }
  return null;
}

function expandFolderRectToContent(
  fk: string,
  rect: Rect,
  tasks: Task[],
  groups: TaskGroup[],
  positions: LayoutState["positions"],
  groupRects: LayoutState["groupRects"],
): Rect {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let has = false;

  for (const t of tasks) {
    if (taskFolderKey(t) !== fk) continue;
    const p = positions[t.id];
    if (!p) continue;
    has = true;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + TASK_NODE_BOUNDS_W);
    maxY = Math.max(maxY, p.y + TASK_NODE_BOUNDS_H);
  }

  for (const g of groups) {
    const firstId = g.taskIds[0];
    if (!firstId) continue;
    const first = tasks.find((t) => t.id === firstId);
    if (!first || taskFolderKey(first) !== fk) continue;
    const r = groupRects[g.id];
    if (!r) continue;
    has = true;
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }

  if (!has) return rect;

  const left = Math.min(rect.x, minX - FOLDER_CONTENT_PAD);
  const top = Math.min(rect.y, minY - FOLDER_CONTENT_PAD);
  const right = Math.max(rect.x + rect.w, maxX + FOLDER_CONTENT_PAD);
  const bottom = Math.max(rect.y + rect.h, maxY + FOLDER_CONTENT_PAD);
  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** 在保留用户拖拽/缩放尺寸的前提下，把各文件夹矩形扩到能包住内部任务与任务组 */
export function mergeFolderRectsWithTaskBounds(
  folderRects: Record<string, Rect>,
  tasks: Task[],
  groups: TaskGroup[],
  positions: LayoutState["positions"],
  groupRects: LayoutState["groupRects"],
): Record<string, Rect> {
  const next = { ...folderRects };
  for (const fk of Object.keys(next)) {
    next[fk] = expandFolderRectToContent(
      fk,
      next[fk],
      tasks,
      groups,
      positions,
      groupRects,
    );
  }
  return next;
}
