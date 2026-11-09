import { ChevronLeft, ChevronRight } from "lucide-react";

type TablePaginationProps = {
  page: number;
  pageCount: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function TablePagination({
  page,
  pageCount,
  count,
  pageSize,
  onPageChange,
}: TablePaginationProps) {
  if (count === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, count);

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
      <p className="text-slate-500">
        Showing <span className="font-bold text-slate-700">{first}–{last}</span> of{" "}
        <span className="font-bold text-slate-700">{count}</span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:bg-[#eaf8f5] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#55b497]"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span className="rounded-xl bg-[#eaf8f5] px-3 py-2 font-bold text-[#16806d]" aria-live="polite">
          Page {page} of {pageCount}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page >= pageCount}
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:bg-[#eaf8f5] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#55b497]"
          aria-label="Next page"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}