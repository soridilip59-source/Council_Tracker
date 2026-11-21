
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Trash2,
  X,
  FolderPlus,
  UserPlus,
  Edit3,
} from "lucide-react";

import { useCouncils } from "../context/CouncilContext";

const initialCategories = ["Academic", "Cultural", "Sports"];

function Councils() {
  // Shared council data from Context API
  const {
    councils,
    setCouncils,
    addCouncil: createCouncil,
    deleteCouncil: removeCouncil,
    updateCouncil,
    addMember,
    removeMember,
  } = useCouncils();

  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("counciltrack-categories"));
      return Array.isArray(saved) ? saved : initialCategories;
    } catch {
      return initialCategories;
    }
  });
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showCouncilForm, setShowCouncilForm] = useState(false);
  const [selectedCouncilId, setSelectedCouncilId] = useState(null);
  const [editingCouncilId, setEditingCouncilId] = useState(null);

  const [newCouncil, setNewCouncil] = useState({
    name: "",
    category: "",
    designation: "",
    description: "",
  });

  const [newMemberName, setNewMemberName] = useState("");

  useEffect(() => {
    localStorage.setItem("counciltrack-categories", JSON.stringify(categories));
  }, [categories]);

  // Get latest selected council
  const selectedCouncil = councils.find(
    (council) => council.id === selectedCouncilId
  );

  // Add Category
  const handleAddCategory = (e) => {
    e.preventDefault();

    const name = newCategory.trim();

    if (!name) return;

    const exists = categories.some(
      (category) => category.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      alert("Category already exists");
      return;
    }

    setCategories((prev) => [...prev, name]);
    setNewCategory("");
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    const name = categoryName.trim();
    if (!name) return;

    const duplicate = categories.some(
      (category) =>
        category !== editingCategory &&
        category.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      alert("Category already exists");
      return;
    }

    setCategories((previous) =>
      previous.map((category) =>
        category === editingCategory ? name : category
      )
    );
    setCouncils((previous) =>
      previous.map((council) =>
        council.category === editingCategory
          ? { ...council, category: name }
          : council
      )
    );
    if (activeCategory === editingCategory) setActiveCategory(name);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleDeleteCategory = (category) => {
    const inUse = councils.some((council) => council.category === category);
    if (inUse) {
      alert("This category is in use by a council and cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete the "${category}" category?`)) return;
    setCategories((previous) =>
      previous.filter((item) => item !== category)
    );
    if (activeCategory === category) setActiveCategory("All");
  };

  // Create Council
  const handleAddCouncil = (e) => {
    e.preventDefault();

    if (
      !newCouncil.name.trim() ||
      !newCouncil.category ||
      !newCouncil.designation.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    const duplicate = councils.some(
      (council) =>
        council.id !== editingCouncilId &&
        council.name.toLowerCase() === newCouncil.name.trim().toLowerCase()
    );
    if (duplicate) {
      alert("A council with this name already exists.");
      return;
    }

    if (editingCouncilId) {
      updateCouncil(editingCouncilId, {
        name: newCouncil.name.trim(),
        category: newCouncil.category,
        designation: newCouncil.designation.trim(),
        description: newCouncil.description.trim(),
      });
      setEditingCouncilId(null);
      setShowCouncilForm(false);
      setNewCouncil({
        name: "",
        category: "",
        designation: "",
        description: "",
      });
      return;
    }

    const council = {
      name: newCouncil.name.trim(),
      category: newCouncil.category,
      designation: newCouncil.designation.trim(),
      description: newCouncil.description.trim(),
      members: [],
    };

    createCouncil(council);

    setNewCouncil({
      name: "",
      category: "",
      designation: "",
      description: "",
    });

    setShowCouncilForm(false);
  };

  // Delete Council
  const handleDeleteCouncil = (id) => {
    if (!window.confirm("Are you sure you want to delete this council?")) {
      return;
    }

    removeCouncil(id);

    if (selectedCouncilId === id) {
      setSelectedCouncilId(null);
    }
  };

  // Add Team Member
  const handleAddMember = (e) => {
    e.preventDefault();

    const name = newMemberName.trim();

    if (!name) {
      alert("Please enter member name");
      return;
    }

    if (!selectedCouncil) return;

    if (selectedCouncil.members.length >= 3) {
      alert("A council can have maximum 3 members.");
      return;
    }

    const alreadyExists = selectedCouncil.members.some(
      (member) => member.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      alert("This member is already added.");
      return;
    }

    addMember(selectedCouncilId, name);

    setNewMemberName("");
  };

  // Remove Team Member
  const handleRemoveMember = (memberId) => {
    if (!window.confirm("Remove this member from the council?")) {
      return;
    }

    removeMember(selectedCouncilId, memberId);
  };

  // Search and Filter
  const filteredCouncils = councils.filter((council) => {
    const categoryMatch =
      activeCategory === "All" ||
      council.category === activeCategory;

    const searchText = search.toLowerCase();

    const searchMatch =
      council.name.toLowerCase().includes(searchText) ||
      council.category.toLowerCase().includes(searchText) ||
      council.designation.toLowerCase().includes(searchText) ||
      council.members.some((member) =>
        member.name.toLowerCase().includes(searchText)
      );

    return categoryMatch && searchMatch;
  });

  // Total Members
  const totalMembers = councils.reduce(
    (total, council) => total + council.members.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Council Management
          </h1>
          <p className="mt-2 text-gray-500">
            Manage councils and their teams.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCouncilId(null);
            setNewCouncil({
              name: "",
              category: "",
              designation: "",
              description: "",
            });
            setShowCouncilForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
        >
          <Plus size={20} />
          Add Council
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat title="Total Councils" value={councils.length} />
        <Stat title="Total Categories" value={categories.length} />
        <Stat title="Total Team Members" value={totalMembers} />
      </div>


      {/* Categories */}
      <div className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <FolderPlus className="text-green-700" />
          Manage Categories
        </h2>

        <form
          onSubmit={handleAddCategory}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-green-600"
          />

          <button
            type="submit"
            className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white"
          >
            <Plus size={18} className="mr-2 inline" />
            Add Category
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            editingCategory === category ? (
              <form
                key={category}
                onSubmit={handleSaveCategory}
                className="flex items-center gap-2 rounded-full bg-green-50 px-2 py-1"
              >
                <input
                  autoFocus
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-36 rounded-full border bg-white px-3 py-1 text-sm"
                />
                <button type="submit" className="text-xs font-bold text-green-700">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="text-xs text-gray-500"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span
                key={category}
                className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-medium text-green-800"
              >
                {category}
                <button
                  type="button"
                  onClick={() => handleEditCategory(category)}
                  className="text-green-700 hover:text-green-900"
                  title={`Edit ${category}`}
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(category)}
                  className="text-red-500 hover:text-red-700"
                  title={`Delete ${category}`}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            )
          ))}
        </div>
      </div>

      {/* Create Council Form */}
      {showCouncilForm && (
        <div className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex justify-between">
            <h2 className="text-xl font-bold">
              {editingCouncilId ? "Edit Council" : "Create New Council"}
            </h2>

            <button
              onClick={() => setShowCouncilForm(false)}
              type="button"
            >
              <X />
            </button>
          </div>

          <form onSubmit={handleAddCouncil} className="space-y-4">
            <input
              value={newCouncil.name}
              onChange={(e) =>
                setNewCouncil({
                  ...newCouncil,
                  name: e.target.value,
                })
              }
              placeholder="Council name"
              className="w-full rounded-lg border px-4 py-3"
            />

            <select
              value={newCouncil.category}
              onChange={(e) =>
                setNewCouncil({
                  ...newCouncil,
                  category: e.target.value,
                })
              }
              className="w-full rounded-lg border bg-white px-4 py-3"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              value={newCouncil.designation}
              onChange={(e) =>
                setNewCouncil({
                  ...newCouncil,
                  designation: e.target.value,
                })
              }
              placeholder="Team designation (e.g. English Facilitator)"
              className="w-full rounded-lg border px-4 py-3"
            />

            <textarea
              value={newCouncil.description}
              onChange={(e) =>
                setNewCouncil({
                  ...newCouncil,
                  description: e.target.value,
                })
              }
              placeholder="Council description"
              rows="3"
              className="w-full rounded-lg border px-4 py-3"
            />

            <p className="text-sm text-gray-500">
              Each council can have up to 3 team members.
            </p>

            <button
              type="submit"
              className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white"
            >
              {editingCouncilId ? "Save Changes" : "Create Council"}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search
          className="absolute left-4 top-3.5 text-gray-400"
          size={20}
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search council or member..."
          className="w-full rounded-xl border bg-white py-3 pl-12 pr-4"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...categories].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-5 py-2 text-sm font-medium ${
              activeCategory === category
                ? "bg-green-700 text-white"
                : "border bg-white text-gray-600 hover:border-green-600"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Council Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredCouncils.map((council) => (
          <div
            key={council.id}
            className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {council.category}
              </span>

              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingCouncilId(council.id);
                    setNewCouncil({
                      name: council.name,
                      category: council.category,
                      designation: council.designation,
                      description: council.description,
                    });
                    setShowCouncilForm(true);
                  }}
                  className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                  title="Edit Council"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteCouncil(council.id)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  title="Delete Council"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              {council.name}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {council.description}
            </p>

            <div className="my-5 border-t pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  Council Team
                </h3>

                <span className="text-xs text-gray-500">
                  {council.members.length}/3 Members
                </span>
              </div>

              <p className="mb-3 text-sm font-medium text-green-700">
                {council.designation}
              </p>

              {council.members.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No team members added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {council.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <span className="text-sm font-medium text-gray-700">
                        {member.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCouncilId(council.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-700 py-2.5 font-semibold text-green-700 hover:bg-green-50"
            >
              <Users size={18} />
              Manage Team
            </button>
          </div>
        ))}
      </div>

      {filteredCouncils.length === 0 && (
        <div className="rounded-xl border bg-white py-12 text-center text-gray-500">
          No councils found.
        </div>
      )}

      {/* Manage Team Modal */}
      {selectedCouncil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6">

            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Manage Team</h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedCouncil.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedCouncilId(null)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            {/* Team Information */}
            <div className="mb-5 rounded-xl bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                {selectedCouncil.designation}
              </p>

              <p className="mt-1 text-sm text-green-700">
                All team members share the same responsibilities.
              </p>

              <p className="mt-2 text-sm font-medium text-green-800">
                {selectedCouncil.members.length} of 3 members added
              </p>
            </div>

            {/* Add Member */}
            {selectedCouncil.members.length < 3 ? (
              <form
                onSubmit={handleAddMember}
                className="mb-6 rounded-xl border bg-gray-50 p-4"
              >
                <h3 className="mb-3 font-semibold">
                  Add Team Member
                </h3>

                <input
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Enter student name"
                  className="w-full rounded-lg border bg-white px-4 py-3"
                />

                <button
                  type="submit"
                  className="mt-3 flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800"
                >
                  <UserPlus size={18} />
                  Add Member
                </button>
              </form>
            ) : (
              <div className="mb-6 rounded-lg bg-orange-50 p-4 text-sm font-medium text-orange-800">
                Maximum 3 members reached. Remove a member to add someone else.
              </div>
            )}

            {/* Current Members */}
            <h3 className="mb-3 font-semibold">Team Members</h3>

            <div className="space-y-3">
              {selectedCouncil.members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 font-semibold text-green-800">
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-gray-800">
                        {member.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Team Member {index + 1}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    title="Remove member"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {selectedCouncil.members.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">
                  No members added yet.
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedCouncilId(null)}
              className="mt-6 w-full rounded-lg bg-gray-900 py-3 font-semibold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </h2>
    </div>
  );
}

export default Councils;
