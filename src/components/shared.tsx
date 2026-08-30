import type { Priority, Difficulty, Status } from "../types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  critical: "#d65d74",
  high: "#ed9467",
  medium: "#d99f45",
  low: "#7bbb9d",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: "#7bbb9d",
  medium: "#d99f45",
  hard: "#ed9467",
  expert: "#d65d74",
};

export const STATUS_LABEL: Record<Status, string> = {
  todo: "TODO",
  in_progress: "IN PROGRESS",
  done: "DONE",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className="mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{
        color: PRIORITY_COLOR[priority],
        background: PRIORITY_COLOR[priority] + "22",
        border: `1px solid ${PRIORITY_COLOR[priority]}44`,
      }}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className="mono text-[10px] font-medium px-1.5 py-0.5 rounded"
      style={{
        color: DIFFICULTY_COLOR[difficulty],
        background: DIFFICULTY_COLOR[difficulty] + "18",
        border: `1px solid ${DIFFICULTY_COLOR[difficulty]}33`,
      }}
    >
      {difficulty.toUpperCase()}
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    todo: "#997281",
    in_progress: "#e36b91",
    done: "#7bbb9d",
  };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[status] }}
    />
  );
}
