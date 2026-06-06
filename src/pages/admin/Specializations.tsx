import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Layers, Plus, Pencil, Save, X } from "lucide-react";

type Specialization = {
  id: number;
  name: string;
  career: string;
  skills: string;
  electives: string;
};

export default function Specializations() {
  const [selectedCareer, setSelectedCareer] = useState("Web Developer");

  const [specializations, setSpecializations] = useState<Specialization[]>([
    {
      id: 1,
      name: "Frontend Developer",
      career: "Web Developer",
      skills: "HTML/CSS, JavaScript, UI/UX Principles",
      electives: "Advanced Web Systems, UI/UX Design Basics",
    },
    {
      id: 2,
      name: "Backend Developer",
      career: "Web Developer",
      skills: "Node.js, REST API, Database Management",
      electives: "RESTful API Development, Database Systems",
    },
    {
      id: 3,
      name: "Full Stack Developer",
      career: "Web Developer",
      skills: "Frontend, Backend, Database, Deployment",
      electives: "Advanced Web Systems, DevOps Fundamentals",
    },
  ]);

  const visibleSpecializations = specializations.filter(
    (item) => item.career === selectedCareer
  );

  const [selectedSpecializationId, setSelectedSpecializationId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const selectedSpecialization =
    specializations.find((item) => item.id === selectedSpecializationId) ||
    visibleSpecializations[0];

  const [formData, setFormData] = useState({
    name: "",
    career: selectedCareer,
    skills: "",
    electives: "",
  });

  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: "",
      career: selectedCareer,
      skills: "",
      electives: "",
    });
  };

  const openEditForm = (item: Specialization) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      name: item.name,
      career: item.career,
      skills: item.skills,
      electives: item.electives,
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const saveSpecialization = () => {
    if (
      !formData.name.trim() ||
      !formData.career.trim() ||
      !formData.skills.trim() ||
      !formData.electives.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    if (editingId) {
      setSpecializations((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
              }
            : item
        )
      );

      setSelectedSpecializationId(editingId);
      setSelectedCareer(formData.career);
    } else {
      const newSpecialization = {
        id: Date.now(),
        ...formData,
      };

      setSpecializations((prev) => [...prev, newSpecialization]);
      setSelectedSpecializationId(newSpecialization.id);
      setSelectedCareer(formData.career);
    }

    closeForm();
  };

  return (
    <AdminLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Specializations
        </p>
        <h1 className="text-4xl font-extrabold mt-2">
          Manage Career Specializations
        </h1>
        <p className="text-slate-600 mt-3">
          Add and edit specializations under each career path.
        </p>
      </section>

      <div className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm mb-6">
        <label className="text-sm font-bold">Select Career</label>
        <select
          value={selectedCareer}
          onChange={(e) => {
            setSelectedCareer(e.target.value);
            const firstMatch = specializations.find(
              (item) => item.career === e.target.value
            );

            if (firstMatch) {
              setSelectedSpecializationId(firstMatch.id);
            }
          }}
          className="w-full md:w-[350px] mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
        >
          <option>Web Developer</option>
          <option>Data Analyst</option>
          <option>Cloud Engineer</option>
          <option>Cybersecurity Analyst</option>
        </select>
      </div>

      <section className="grid xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Layers className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Specialization List</h2>
          </div>

          <div className="space-y-3">
            {visibleSpecializations.length > 0 ? (
              visibleSpecializations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSpecializationId(item.id)}
                  className={`w-full text-left font-bold px-5 py-4 rounded-xl transition ${
                    selectedSpecializationId === item.id
                      ? "bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white"
                      : "bg-[#eaf8f5] hover:bg-[#d9f3ee]"
                  }`}
                >
                  {item.name}
                </button>
              ))
            ) : (
              <p className="text-slate-500 bg-[#f8fcfb] p-5 rounded-xl">
                No specializations yet for this career.
              </p>
            )}
          </div>

          <button
            onClick={openAddForm}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white px-5 py-3 rounded-xl font-bold"
          >
            <Plus size={18} />
            Add New Specialization
          </button>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold">Specialization Details</h2>

            {selectedSpecialization && (
              <button
                onClick={() => openEditForm(selectedSpecialization)}
                className="inline-flex items-center gap-2 bg-[#eaf8f5] text-[#16806d] px-4 py-2 rounded-xl font-bold"
              >
                <Pencil size={16} />
                Edit
              </button>
            )}
          </div>

          {!showForm ? (
            selectedSpecialization ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#f8fcfb] p-6 rounded-2xl border border-teal-100">
                  <p className="text-sm text-slate-500">Specialization Name</p>
                  <h3 className="text-2xl font-extrabold text-[#16806d]">
                    {selectedSpecialization.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-5">Career</p>
                  <p className="font-bold">{selectedSpecialization.career}</p>
                </div>

                <div className="bg-[#f8fcfb] p-6 rounded-2xl border border-teal-100">
                  <h3 className="font-extrabold mb-3">Required Skills</h3>
                  <p>{selectedSpecialization.skills}</p>
                </div>

                <div className="md:col-span-2 bg-[#f8fcfb] p-6 rounded-2xl border border-teal-100">
                  <h3 className="font-extrabold mb-3">
                    Recommended Electives
                  </h3>
                  <p>{selectedSpecialization.electives}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Select or add a specialization.</p>
            )
          ) : (
            <div className="bg-[#f8fcfb] border border-teal-100 rounded-2xl p-6">
              <h3 className="text-xl font-extrabold mb-5">
                {editingId ? "Edit Specialization" : "Add New Specialization"}
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold">
                    Specialization Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Example: Frontend Developer"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Career</label>
                  <select
                    value={formData.career}
                    onChange={(e) =>
                      setFormData({ ...formData, career: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                  >
                    <option>Web Developer</option>
                    <option>Data Analyst</option>
                    <option>Cloud Engineer</option>
                    <option>Cybersecurity Analyst</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold">Required Skills</label>
                  <textarea
                    rows={4}
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="HTML/CSS, JavaScript, UI/UX Principles"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Recommended Electives
                  </label>
                  <textarea
                    rows={4}
                    value={formData.electives}
                    onChange={(e) =>
                      setFormData({ ...formData, electives: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Advanced Web Systems, UI/UX Design Basics"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveSpecialization}
                  className="inline-flex items-center gap-2 bg-[#55b497] text-white px-6 py-3 rounded-xl font-bold"
                >
                  <Save size={18} />
                  Save Specialization
                </button>

                <button
                  onClick={closeForm}
                  className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}