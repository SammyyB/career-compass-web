import { useEffect, useMemo, useState } from "react";
import { Briefcase, Pencil, Plus, Save, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import InlineNotice from "../../components/InlineNotice";
import TablePagination from "../../components/TablePagination";
import { useAuth } from "../../context/AuthContext";
import type { Career, Skill } from "../../lib/types";
import { listCareers, listSkills, saveCareer } from "../../services/repository";

type ThresholdForm = Record<string, string>;
type CareerForm = {
  name: string;
  category: string;
  description: string;
  entry: ThresholdForm;
  junior: ThresholdForm;
  senior: ThresholdForm;
};
const pageSize = 8;
const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-1";
const emptyThresholds = (skills: Skill[]) =>
  Object.fromEntries(skills.map((skill) => [skill.name, ""]));
const createEmptyForm = (skills: Skill[]): CareerForm => ({
  name: "",
  category: "",
  description: "",
  entry: emptyThresholds(skills),
  junior: emptyThresholds(skills),
  senior: emptyThresholds(skills),
});
const formFromCareer = (career: Career, skills: Skill[]): CareerForm => ({
  name: career.name,
  category: career.category,
  description: career.description,
  entry: Object.fromEntries(
    skills.map((skill) => [
      skill.name,
      career.entry_thresholds[skill.name]?.toString() ?? "",
    ]),
  ),
  junior: Object.fromEntries(
    skills.map((skill) => [
      skill.name,
      career.junior_thresholds[skill.name]?.toString() ?? "",
    ]),
  ),
  senior: Object.fromEntries(
    skills.map((skill) => [
      skill.name,
      career.senior_thresholds[skill.name]?.toString() ?? "",
    ]),
  ),
});
const parseThresholds = (values: ThresholdForm, label: string) => {
  const result: Record<string, number> = {};
  Object.entries(values).forEach(([skill, raw]) => {
    if (!raw.trim()) return;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 100)
      throw new Error(
        `${label} threshold for ${skill} must be a number from 0 to 100.`,
      );
    result[skill] = value;
  });
  return result;
};

export default function CareerProfiles() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CareerForm>(createEmptyForm([]));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [careerData, skillData] = await Promise.all([
        listCareers(),
        listSkills(),
      ]);
      setCareers(careerData);
      setSkills(skillData);
      const target = searchParams.get("id")
        ? careerData.find((career) => career.id === searchParams.get("id"))
        : undefined;
      if (target) openEditForm(target, skillData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load career profiles.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return careers.filter((career) =>
      `${career.name} ${career.category}`.toLowerCase().includes(query),
    );
  }, [careers, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  function openAddForm() {
    setEditing(null);
    setForm(createEmptyForm(skills));
    setShowForm(true);
    setError("");
  }
  function openEditForm(career: Career, sourceSkills = skills) {
    setEditing(career.id);
    setForm(formFromCareer(career, sourceSkills));
    setShowForm(true);
  }
  function closeForm() {
    setEditing(null);
    setForm(createEmptyForm(skills));
    setShowForm(false);
  }
  function updateThreshold(
    level: "entry" | "junior" | "senior",
    skillName: string,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [level]: { ...current[level], [skillName]: value },
    }));
  }

  const save = async () => {
    if (!profile) return;
    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.description.trim()
    ) {
      setError("Career name, category, and description are required.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveCareer(profile.id, editing, {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        entry_thresholds: parseThresholds(form.entry, "Entry-level"),
        junior_thresholds: parseThresholds(form.junior, "Junior"),
        senior_thresholds: parseThresholds(form.senior, "Senior"),
      });
      closeForm();
      setNotice(
        editing ? "Career profile updated." : "Career profile created.",
      );
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save career profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Career Profiles
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Manage Career Paths</h1>
        <p className="mt-3 text-slate-600">
          Configure primary career paths and numeric thresholds used by student
          recommendations.
        </p>
      </section>
      <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Briefcase className="text-[#16806d]" />
            <div>
              <h2 className="text-2xl font-extrabold">Career Table</h2>
              <p className="mt-1 text-sm text-slate-500">
                Readiness = current score ÷ required threshold × 100. Example:
                60 current ÷ 80 required × 100 = 75% readiness.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="career-search">
              Search career profiles
            </label>
            <input
              id="career-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search careers..."
              className={`rounded-xl border border-slate-200 p-3 ${focusClass}`}
            />
            <button
              type="button"
              onClick={openAddForm}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] px-5 py-3 font-bold text-white ${focusClass}`}
            >
              <Plus size={18} />
              Add Career
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-5">
            <InlineNotice
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />
          </div>
        )}
        {notice && (
          <div className="mb-5">
            <InlineNotice
              type="success"
              message={notice}
              onDismiss={() => setNotice("")}
            />
          </div>
        )}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-teal-100 bg-[#f8fcfb] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">
                {editing ? "Edit Career" : "Add Career"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className={`text-slate-400 hover:text-slate-700 ${focusClass}`}
                aria-label="Close career form"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">
                Career Name
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                  placeholder="Web Developer"
                />
              </label>
              <label className="text-sm font-bold">
                Category
                <input
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                  placeholder="Software Development"
                />
              </label>
              <label className="text-sm font-bold md:col-span-2">
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                  placeholder="Describe the career path."
                />
              </label>
            </div>
            <div className="mt-7">
              <h3 className="font-extrabold text-[#16806d]">
                Numeric Skill Thresholds
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Use 0–100. Leave a skill blank only when it is not required.
              </p>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-3">
              {(
                [
                  ["entry", "Entry-Level Target"],
                  ["junior", "Junior Target"],
                  ["senior", "Senior Target"],
                ] as const
              ).map(([level, label]) => (
                <div
                  key={level}
                  className="rounded-2xl border border-teal-100 bg-white p-5"
                >
                  <h4 className="mb-4 font-extrabold">{label}</h4>
                  <div className="space-y-3">
                    {skills.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Add skills first.
                      </p>
                    ) : (
                      skills.map((skill) => (
                        <label
                          key={skill.id}
                          className="block text-sm font-semibold"
                        >
                          {skill.name}
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={form[level][skill.name] ?? ""}
                            onChange={(event) =>
                              updateThreshold(
                                level,
                                skill.name,
                                event.target.value,
                              )
                            }
                            placeholder="0–100"
                            className={`mt-1 w-full rounded-lg border border-slate-200 p-2.5 ${focusClass}`}
                          />
                        </label>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#55b497] px-6 py-3 font-bold text-white disabled:opacity-60 ${focusClass}`}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Career"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className={`inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 ${focusClass}`}
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">
              Career profiles and thresholds
            </caption>
            <thead>
              <tr className="bg-[#eaf8f5]">
                <th className="p-4">Career</th>
                <th className="p-4">Category</th>
                <th className="p-4">Entry Targets</th>
                <th className="p-4">Record Info</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Loading career profiles...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No career profiles match the current search.
                  </td>
                </tr>
              ) : (
                visible.map((career) => {
                  const creatorName =
                    career.created_by === profile?.id
                      ? [profile.first_name, profile.last_name]
                          .filter(Boolean)
                          .join(" ") || "You"
                      : "Administrator";
                  return (
                    <tr key={career.id} className="border-b border-slate-100">
                      <td className="p-4 font-bold">{career.name}</td>
                      <td className="p-4">{career.category}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(career.entry_thresholds).map(
                            ([skill, value]) => (
                              <span
                                key={skill}
                                className="rounded-full border border-teal-100 bg-[#f8fcfb] px-2 py-1 text-xs"
                              >
                                {skill}: {value}%
                              </span>
                            ),
                          )}
                        </div>
                        {Object.keys(career.entry_thresholds).length === 0 && (
                          <span className="text-sm text-orange-700">
                            Missing threshold
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        <p>Created by: {creatorName}</p>
                        <p>
                          Updated:{" "}
                          {new Date(career.updated_at).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(career)}
                          className={`inline-flex items-center gap-2 rounded-xl bg-[#eaf8f5] px-4 py-2 font-bold text-[#16806d] ${focusClass}`}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <TablePagination
            page={page}
            pageCount={pageCount}
            count={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}
        {error && !loading && (
          <button
            type="button"
            onClick={() => void load()}
            className={`mt-4 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white ${focusClass}`}
          >
            Retry loading careers
          </button>
        )}
      </section>
    </AdminLayout>
  );
}
