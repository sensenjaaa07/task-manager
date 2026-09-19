import type { Priority, Difficulty, Status, Subject } from "../types";

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

function subjectTextColor(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return "#ffffff";
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#493540" : "#ffffff";
}

export function SubjectBadge({ subject }: { subject: Subject }) {
  return (
    <span
      className="mono text-[10px] font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1.5"
      style={{ background: subject.color, color: subjectTextColor(subject.color) }}
      title={subject.name + " · " + subject.color}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {subject.name}
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
