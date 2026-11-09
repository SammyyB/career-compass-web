import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";

type SearchableMultiSelectProps = {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  max: number;
};

export default function SearchableMultiSelect({
  label,
  options,
  values,
  onChange,
  max,
}: SearchableMultiSelectProps) {
  const [query, setQuery] = useState("");
  const inputId = `multi-select-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase())
      ),
    [options, query]
  );

  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    if (values.length >= max) return;
    onChange([...values, option]);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-bold text-slate-700">{label}</label>
        <span className="text-xs text-slate-500">
          {values.length}/{max} selected
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3 border border-slate-200 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#55b497]">
        <Search size={17} className="text-slate-400" />
        <input
          id={inputId}
          aria-label={`Search ${label}`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full py-3 outline-none"
          placeholder={`Search ${label.toLowerCase()}...`}
        />
      </div>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 bg-[#eaf8f5] text-[#16806d] px-3 py-1.5 rounded-full text-xs font-bold"
            >
              {value}
              <button
                type="button"
                onClick={() => toggle(value)}
                aria-label={`Remove ${value}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3 max-h-36 overflow-y-auto pr-1">
        {filteredOptions.map((option) => {
          const selected = values.includes(option);
          const disabled = !selected && values.length >= max;

          return (
            <button
              type="button"
              key={option}
              disabled={disabled}
              onClick={() => toggle(option)}
                aria-pressed={selected}
              className={`flex items-center gap-2 text-left p-2.5 rounded-lg border text-xs font-semibold transition ${
                selected
                  ? "bg-[#eaf8f5] border-[#55b497] text-[#16806d]"
                  : disabled
                  ? "border-slate-100 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Check size={14} className={selected ? "opacity-100" : "opacity-0"} aria-hidden="true" />
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}