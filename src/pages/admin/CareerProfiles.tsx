import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Briefcase, Save, FileText, Plus, Pencil, X } from "lucide-react";

type Career = {
  id: number;
  name: string;
  category: string;
  description: string;
  entry: string;
  junior: string;
  senior: string;
};

export default function CareerProfiles() {
  const [careers, setCareers] = useState<Career[]>([
    {
      id: 1,
      name: "Web Developer",
      category: "Software Development",
      description: "Designs and maintains web applications.",
      entry: "Programming: 80%, Web Development: 75%, Database: 70%",
      junior: "Programming: 85%, Web Development: 85%, Database: 75%",
      senior: "Programming: 90%, Web Development: 90%, Database: 85%",
    },
    {
      id: 2,
      name: "Data Analyst",
      category: "Data Systems",
      description: "Analyzes data to support business decisions.",
      entry: "Database: 75%, Statistics: 70%, Visualization: 70%",
      junior: "Database: 80%, Statistics: 80%, Visualization: 75%",
      senior: "Database: 90%, Statistics: 85%, Visualization: 85%",
    },
    {
      id: 3,
      name: "Cloud Engineer",
      category: "Infrastructure",
      description: "Deploys and manages cloud infrastructure.",
      entry: "Networking: 75%, Deployment: 70%, Linux: 70%",
      junior: "Networking: 80%, Deployment: 80%, Linux: 75%",
      senior: "Networking: 90%, Deployment: 85%, Linux: 85%",
    },
  ]);

  const [selectedCareerId, setSelectedCareerId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const selectedCareer =
    careers.find((career) => career.id === selectedCareerId) || careers[0];

  const [formData, setFormData] = useState({
    name: selectedCareer.name,
    category: selectedCareer.category,
    description: selectedCareer.description,
    entry: selectedCareer.entry,
    junior: selectedCareer.junior,
    senior: selectedCareer.senior,
  });

  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      entry: "",
      junior: "",
      senior: "",
    });
  };

  const openEditForm = (career: Career) => {
    setShowForm(true);
    setEditingId(career.id);
    setFormData({
      name: career.name,
      category: career.category,
      description: career.description,
      entry: career.entry,
      junior: career.junior,
      senior: career.senior,
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const saveCareer = () => {
    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.description.trim()
    ) {
      alert("Please complete career name, category, and description.");
      return;
    }

    if (editingId) {
      setCareers((prev) =>
        prev.map((career) =>
          career.id === editingId
            ? {
                ...career,
                ...formData,
              }
            : career
        )
      );

      setSelectedCareerId(editingId);
    } else {
      const newCareer = {
        id: Date.now(),
        ...formData,
      };

      setCareers((prev) => [...prev, newCareer]);
      setSelectedCareerId(newCareer.id);
    }

    closeForm();
  };

  return (
    <AdminLayout>
      <section className="bg-gradient-to-r from-[#e1f8f4] to-[#f0fbf9] rounded-3xl p-9 mb-8 border border-teal-100 shadow-sm">
        <p className="text-sm font-bold text-teal-700 uppercase tracking-wide">
          Career Profiles
        </p>
        <h1 className="text-4xl font-extrabold mt-2">Manage Career Paths</h1>
        <p className="text-slate-600 mt-3">
          Add, edit, and configure career details and threshold levels.
        </p>
      </section>

      <section className="grid xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="text-[#16806d]" />
            <h2 className="text-2xl font-extrabold">Career List</h2>
          </div>

          <div className="space-y-3">
            {careers.map((career) => (
              <button
                key={career.id}
                onClick={() => setSelectedCareerId(career.id)}
                className={`w-full text-left font-bold px-5 py-4 rounded-xl transition ${
                  selectedCareerId === career.id
                    ? "bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white"
                    : "bg-[#eaf8f5] hover:bg-[#d9f3ee] text-slate-800"
                }`}
              >
                {career.name}
              </button>
            ))}
          </div>

          <button
            onClick={openAddForm}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#1f8f78] to-[#36a889] text-white px-5 py-3 rounded-xl font-bold"
          >
            <Plus size={18} />
            Add New Career
          </button>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl p-7 border border-teal-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <FileText className="text-[#16806d]" />
              <h2 className="text-2xl font-extrabold">
                Career Configuration
              </h2>
            </div>

            <button
              onClick={() => openEditForm(selectedCareer)}
              className="inline-flex items-center gap-2 bg-[#eaf8f5] text-[#16806d] px-4 py-2 rounded-xl font-bold"
            >
              <Pencil size={16} />
              Edit Career
            </button>
          </div>

          {!showForm ? (
            <div className="space-y-6">
              <div className="bg-[#f8fcfb] p-6 rounded-2xl border border-teal-100">
                <p className="text-sm text-slate-500">Career Name</p>
                <h3 className="text-3xl font-extrabold text-[#16806d]">
                  {selectedCareer.name}
                </h3>

                <p className="mt-4 text-sm text-slate-500">Category</p>
                <p className="font-bold">{selectedCareer.category}</p>

                <p className="mt-4 text-sm text-slate-500">Description</p>
                <p>{selectedCareer.description}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div className="bg-[#f8fcfb] p-5 rounded-2xl border border-teal-100">
                  <h3 className="font-extrabold text-[#16806d] mb-3">
                    Entry Level
                  </h3>
                  <p>{selectedCareer.entry}</p>
                </div>

                <div className="bg-[#f8fcfb] p-5 rounded-2xl border border-teal-100">
                  <h3 className="font-extrabold text-[#16806d] mb-3">
                    Junior Level
                  </h3>
                  <p>{selectedCareer.junior}</p>
                </div>

                <div className="bg-[#f8fcfb] p-5 rounded-2xl border border-teal-100">
                  <h3 className="font-extrabold text-[#16806d] mb-3">
                    Senior Level
                  </h3>
                  <p>{selectedCareer.senior}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#f8fcfb] border border-teal-100 rounded-2xl p-6">
              <h3 className="text-xl font-extrabold mb-5">
                {editingId ? "Edit Career" : "Add New Career"}
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold">Career Name</label>
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Example: Web Developer"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Category</label>
                  <input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Example: Software Development"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Career description"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Entry Thresholds</label>
                  <textarea
                    rows={4}
                    value={formData.entry}
                    onChange={(e) =>
                      setFormData({ ...formData, entry: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Programming: 80%, Web Development: 75%"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold">Junior Thresholds</label>
                  <textarea
                    rows={4}
                    value={formData.junior}
                    onChange={(e) =>
                      setFormData({ ...formData, junior: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Programming: 85%, Web Development: 85%"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold">Senior Thresholds</label>
                  <textarea
                    rows={4}
                    value={formData.senior}
                    onChange={(e) =>
                      setFormData({ ...formData, senior: e.target.value })
                    }
                    className="w-full mt-2 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#55b497]"
                    placeholder="Programming: 90%, Web Development: 90%"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveCareer}
                  className="inline-flex items-center gap-2 bg-[#55b497] text-white px-6 py-3 rounded-xl font-bold"
                >
                  <Save size={18} />
                  Save Career
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