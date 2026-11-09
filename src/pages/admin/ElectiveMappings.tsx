import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Pencil, Plus, Save, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import InlineNotice from "../../components/InlineNotice";
import TablePagination from "../../components/TablePagination";
import { useAuth } from "../../context/AuthContext";
import type { Elective, ElectiveMapping, Skill } from "../../lib/types";
import {
  listElectiveMappings,
  listElectives,
  listSkills,
  saveElectiveMapping,
} from "../../services/repository";

const pageSize = 8;
const defaultFormula =
  "New score = minimum(100, current score + boost percentage points)";
const focusClass =
  "focus:outline-none focus:ring-2 focus:ring-[#55b497] focus:ring-offset-1";

export default function ElectiveMappings() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [mappings, setMappings] = useState<ElectiveMapping[]>([]);
  const [electives, setElectives] = useState<Elective[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    electiveId: "",
    skillId: "",
    boost: "10",
    formula: defaultFormula,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [mappingData, electiveData, skillData] = await Promise.all([
        listElectiveMappings(),
        listElectives(),
        listSkills(),
      ]);
      setMappings(mappingData);
      setElectives(electiveData);
      setSkills(skillData);
      const targetId = searchParams.get("id");
      const target = targetId
        ? mappingData.find((mapping) => mapping.id === targetId)
        : undefined;
      if (target) openEditForm(target);
      const targetElective = searchParams.get("electiveId");
      if (targetElective && !target)
        setSearch(
          electiveData.find((item) => item.id === targetElective)?.name ?? "",
        );
      setForm((current) => ({
        ...current,
        electiveId: current.electiveId || electiveData[0]?.id || "",
        skillId: current.skillId || skillData[0]?.id || "",
      }));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load elective mappings.",
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
    return mappings.filter((mapping) =>
      `${mapping.elective?.name ?? ""} ${mapping.skill?.name ?? ""} ${mapping.formula}`
        .toLowerCase()
        .includes(query),
    );
  }, [mappings, search]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  function openAddForm() {
    setEditing(null);
    setShowForm(true);
    setForm({
      electiveId: electives[0]?.id ?? "",
      skillId: skills[0]?.id ?? "",
      boost: "10",
      formula: defaultFormula,
    });
  }
  function openEditForm(mapping: ElectiveMapping) {
    setEditing(mapping.id);
    setShowForm(true);
    setForm({
      electiveId: mapping.elective_id,
      skillId: mapping.skill_id,
      boost: String(mapping.boost_percentage),
      formula: mapping.formula || defaultFormula,
    });
  }
  function closeForm() {
    setEditing(null);
    setShowForm(false);
    setForm({
      electiveId: electives[0]?.id ?? "",
      skillId: skills[0]?.id ?? "",
      boost: "10",
      formula: defaultFormula,
    });
  }

  const save = async () => {
    if (!profile || !form.electiveId || !form.skillId) {
      setError("Select both an elective and a skill.");
      return;
    }
    const boost = Number(form.boost);
    if (!Number.isFinite(boost) || boost < 0 || boost > 100) {
      setError("Boost percentage must be a number from 0 to 100.");
      return;
    }
    if (!form.formula.trim()) {
      setError("The formula explanation is required.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await saveElectiveMapping(profile.id, editing, {
        elective_id: form.electiveId,
        skill_id: form.skillId,
        boost_percentage: boost,
        formula: form.formula.trim(),
      });
      closeForm();
      setNotice(
        editing ? "Elective mapping updated." : "Elective mapping created.",
      );
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save elective mapping.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="mb-8 rounded-3xl border border-teal-100 bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] p-9 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">
          Elective Mappings
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">
          Connect Electives to Skills
        </h1>
        <p className="mt-3 text-slate-600">
          Configure numeric boosts and the exact formula used by student
          elective recommendations.
        </p>
      </section>
      <section className="rounded-3xl border border-teal-100 bg-white p-8 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="text-[#16806d]" />
            <div>
              <h2 className="text-2xl font-extrabold">Mapping Table</h2>
              <p className="mt-1 text-sm text-slate-500">
                Example: current 60 + 10 boost points = new score 70 (capped at
                100).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="sr-only" htmlFor="mapping-search">
              Search elective mappings
            </label>
            <input
              id="mapping-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search mappings..."
              className={`rounded-xl border border-slate-200 p-3 ${focusClass}`}
            />
            <button
              type="button"
              onClick={openAddForm}
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1f8f78] to-[#36a889] px-5 py-3 font-bold text-white ${focusClass}`}
            >
              <Plus size={18} />
              Add Mapping
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
                {editing ? "Edit Mapping" : "Add Mapping"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className={`text-slate-400 hover:text-slate-700 ${focusClass}`}
                aria-label="Close mapping form"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">
                Elective
                <select
                  value={form.electiveId}
                  onChange={(event) =>
                    setForm({ ...form, electiveId: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                >
                  <option value="">Select an elective</option>
                  {electives.map((elective) => (
                    <option key={elective.id} value={elective.id}>
                      {elective.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Skill Improved
                <select
                  value={form.skillId}
                  onChange={(event) =>
                    setForm({ ...form, skillId: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                >
                  <option value="">Select a skill</option>
                  {skills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold">
                Boost Percentage Points
                <input
                  value={form.boost}
                  onChange={(event) =>
                    setForm({ ...form, boost: event.target.value })
                  }
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  A boost is added to the current score, not multiplied.
                </span>
              </label>
              <label className="text-sm font-bold">
                Formula Explanation
                <input
                  value={form.formula}
                  onChange={(event) =>
                    setForm({ ...form, formula: event.target.value })
                  }
                  className={`mt-2 w-full rounded-xl border border-slate-200 p-3 ${focusClass}`}
                />
              </label>
            </div>
            <div className="mt-5 rounded-2xl border border-teal-100 bg-white p-4 text-sm text-slate-600">
              <strong className="text-[#16806d]">Formula:</strong> New score =
              minimum(100, current score + boost percentage points). Example: 60
              current + 10 boost = 70 new score.
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className={`inline-flex items-center gap-2 rounded-xl bg-[#55b497] px-6 py-3 font-bold text-white disabled:opacity-60 ${focusClass}`}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Mapping"}
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
            <caption className="sr-only">Elective to skill mappings</caption>
            <thead>
              <tr className="bg-[#eaf8f5]">
                <th className="p-4">Elective</th>
                <th className="p-4">Skill</th>
                <th className="p-4">Boost</th>
                <th className="p-4">Formula</th>
                <th className="p-4">Record Info</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading elective mappings...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No elective mappings match the current search.
                  </td>
                </tr>
              ) : (
                visible.map((mapping) => {
                  const creatorName =
                    mapping.created_by === profile?.id
                      ? [profile.first_name, profile.last_name]
                          .filter(Boolean)
                          .join(" ") || "You"
                      : "Administrator";
                  return (
                    <tr key={mapping.id} className="border-b border-slate-100">
                      <td className="p-4 font-bold">
                        {mapping.elective?.name ?? "-"}
                      </td>
                      <td className="p-4">{mapping.skill?.name ?? "-"}</td>
                      <td className="p-4 font-extrabold text-[#16806d]">
                        +{mapping.boost_percentage} percentage points
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {mapping.formula}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        <p>Created by: {creatorName}</p>
                        <p>
                          Updated:{" "}
                          {new Date(mapping.updated_at).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => openEditForm(mapping)}
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
            Retry loading mappings
          </button>
        )}
      </section>
    </AdminLayout>
  );
}