import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type NoticeType = "error" | "success" | "info";

type InlineNoticeProps = {
  type: NoticeType;
  message: string;
  onDismiss?: () => void;
};

const styles: Record<NoticeType, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function InlineNotice({
  type,
  message,
  onDismiss,
}: InlineNoticeProps) {
  const Icon = type === "error" ? XCircle : type === "success" ? CheckCircle2 : Info;

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold ${styles[type]}`}
      role={type === "error" ? "alert" : "status"}
    >
      <div className="flex items-start gap-3">
        <Icon size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-current"
          aria-label="Dismiss message"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}