type GraphLegendProps = {
  showSkillGap?: boolean;
};

export default function GraphLegend({ showSkillGap = true }: GraphLegendProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600"
      aria-label="Graph legend"
    >
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#55b497]" aria-hidden="true" />
        Current score
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-slate-800" aria-hidden="true" />
        Required threshold
      </span>
      {showSkillGap && (
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange-400" aria-hidden="true" />
          Skill gap
        </span>
      )}
    </div>
  );
}