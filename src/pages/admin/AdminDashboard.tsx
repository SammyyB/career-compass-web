import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Activity,
  Briefcase,
  GraduationCap,
  ListChecks,
  TrendingUp,
  Users,
} from "lucide-react";

import AdminLayout from "../../components/AdminLayout";
import InlineNotice from "../../components/InlineNotice";
import { supabase } from "../../lib/supabase";
import type { AuditLog, DataQualitySummary } from "../../lib/types";
import {
  getCount,
  getDataQualitySummary,
  listRecentAuditLogs,
} from "../../services/repository";

type Counts = {
  students: number;
  careers: number;
  electives: number;
  skills: number;
};

type AuditUpdate = AuditLog;

const initialCounts: Counts = {
  students: 0,
  careers: 0,
  electives: 0,
  skills: 0,
};

const emptyQuality: DataQualitySummary = {
  incompleteProfiles: [],
  missingThresholds: [],
  unmappedElectives: [],
  studentsWithoutSkillScores: [],
};

const formatName = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>(initialCounts);
  const [updates, setUpdates] = useState<AuditUpdate[]>([]);
  const [quality, setQuality] = useState<DataQualitySummary>(emptyQuality);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        { count: studentCount, error: studentError },
        careerCount,
        electiveCount,
        skillCount,
        qualityData,
        auditData,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "student"),
        getCount("careers"),
        getCount("electives"),
        getCount("skills"),
        getDataQualitySummary(),
        listRecentAuditLogs(8),
      ]);

      if (studentError) throw studentError;

      setCounts({
        students: studentCount ?? 0,
        careers: careerCount,
        electives: electiveCount,
        skills: skillCount,
      });

      setUpdates(auditData as AuditUpdate[]);
      setQuality(qualityData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load the admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();

    const liveChannel = supabase
      .channel("admin-dashboard-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "careers" }, () => void loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "electives" }, () => void loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "skills" }, () => void loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, () => void loadDashboard())
      .subscribe();

    return () => {
      void supabase.removeChannel(liveChannel);
    };
  }, []);

  const cards = [
    { label: "Total Students", value: counts.students, icon: Users },
    { label: "Career Profiles", value: counts.careers, icon: Briefcase },
    {
      label: "Electives Available",
      value: counts.electives,
      icon: GraduationCap,
    },
    { label: "Skills Tracked", value: counts.skills, icon: ListChecks },
  ];

  const largestCount = useMemo(
    () => Math.max(...cards.map((card) => card.value), 1),
    [cards]
  );

  return (
    <AdminLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
              Admin Dashboard
            </p>

            <h1 className="text-4xl font-extrabold mt-2">
              System Overview
            </h1>

            <p className="text-slate-600 mt-3">
              Monitor live Supabase records, data coverage, and administrator
              activity.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#16806d]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Live database updates enabled
            </p>
          </div>

        </div>
      </section>

      {error && <div className="mb-6"><InlineNotice type="error" message={error} onDismiss={() => setError("")} /></div>}

      <section className="grid xl:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#eaf8f5] text-[#16806d] flex items-center justify-center mb-5">
                <Icon size={26} />
              </div>

              <p className="text-sm text-slate-500">{card.label}</p>

              <h2 className="text-4xl font-extrabold text-slate-900 mt-2">
                {loading ? "—" : card.value}
              </h2>
            </div>
          );
        })}
      </section>

      <section className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-[#16806d]" />
            <div>
              <h2 className="text-2xl font-extrabold">Data Coverage</h2>
              <p className="text-sm text-slate-500 mt-1">
                Current record counts from Supabase.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {cards.map((card) => (
              <div key={card.label}>
                <div className="flex justify-between gap-4 text-sm font-semibold">
                  <span>{card.label}</span>
                  <span className="text-[#16806d]">{card.value}</span>
                </div>

                <div className="h-4 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-4 bg-gradient-to-r from-[#1f8f78] to-[#55b497] rounded-full transition-all"
                    style={{
                      width:
                        (card.value / largestCount) * 100 + "%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="text-[#16806d]" />
            <div>
              <h2 className="text-2xl font-extrabold">Recent Admin Updates</h2>
              <p className="text-sm text-slate-500 mt-1">
                Audit activity from career, skill, specialization, and elective
                changes.
              </p>
            </div>
          </div>

          {updates.length === 0 ? (
            <p className="text-slate-500 bg-[#f8fcfb] rounded-2xl p-5">
              Audit activity will appear here after an administrator changes a
              record.
            </p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="border-b border-slate-100 pb-4 last:border-b-0"
                >
                  <p className="font-bold">
                    {formatName(update.action)} on{" "}
                    {formatName(update.entity_table)}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Created by {[update.actor?.first_name, update.actor?.middle_name, update.actor?.last_name].filter(Boolean).join(" ") || update.actor?.email || "System administrator"} ·{" "}
                    {new Date(update.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-500" />
            <div>
              <h2 className="text-2xl font-extrabold">Data Quality Checks</h2>
              <p className="mt-1 text-sm text-slate-500">Review records that could make student recommendations incomplete or misleading.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QualityCard title="Incomplete profiles" count={quality.incompleteProfiles.length} detail="Missing required profile fields" path="/admin/students" />
          <QualityCard title="Missing thresholds" count={quality.missingThresholds.length} detail="Career levels need thresholds" path="/admin/career-profiles" />
          <QualityCard title="Unmapped electives" count={quality.unmappedElectives.length} detail="Electives need skill mappings" path="/admin/elective-mappings" />
          <QualityCard title="No skill scores" count={quality.studentsWithoutSkillScores.length} detail="Students need an assessment" path="/admin/students" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <QualityList title="Highest-priority records" records={[...quality.incompleteProfiles, ...quality.missingThresholds].slice(0, 6)} />
          <QualityList title="Mapping and assessment follow-up" records={[...quality.unmappedElectives, ...quality.studentsWithoutSkillScores].slice(0, 6)} />
        </div>
      </section>
    </AdminLayout>
  );
}

function QualityCard({ title, count, detail, path }: { title: string; count: number; detail: string; path: string }) {
  return (
    <a href={`#${path}`} className="rounded-2xl border border-slate-100 bg-[#f8fcfb] p-5 transition hover:border-teal-200 hover:bg-[#eaf8f5] focus:outline-none focus:ring-2 focus:ring-[#55b497]">
      <p className="text-sm font-bold text-slate-600">{title}</p>
      <p className={`mt-2 text-4xl font-extrabold ${count > 0 ? "text-orange-600" : "text-[#16806d]"}`}>{count}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </a>
  );
}

function QualityList({ title, records }: { title: string; records: Array<{ id: string; label: string; detail: string }> }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#f8fcfb] p-5">
      <h3 className="font-extrabold">{title}</h3>
      {records.length === 0 ? <p className="mt-4 text-sm font-semibold text-emerald-700">No quality issues found in this group.</p> : <div className="mt-4 space-y-3">{records.map((record) => <div key={`${record.id}-${record.label}`} className="rounded-xl bg-white p-3"><p className="font-bold">{record.label}</p><p className="mt-1 text-xs text-slate-500">{record.detail}</p></div>)}</div>}
    </div>
  );
}