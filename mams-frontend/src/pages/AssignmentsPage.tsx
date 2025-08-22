// src/pages/AssignmentsPage.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import CustomDropdown from "../components/CustomDropdown";

interface Assignment {
  id: number;
  item: string;
  quantity: number;
  baseLocation: string;
  personnel: string;
  dateAssigned: string;
}

interface AvailableItem {
  item: string;
  available: number;
  assignable: number;
  alreadyAssigned: number;
}

type Base = { id: number; name: string };

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bases, setBases] = useState<Base[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [personnelList, setPersonnelList] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    baseLocation: "",
    item: "",
    personnel: "",
    quantity: 0,
    date: "",
  });

  // filter state
  const [filterItem, setFilterItem] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [uniqueItems, setUniqueItems] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Assignment[]>("/assignments");
      setAssignments(data);
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAssignments(); 
  }, []);

  // Load unique items for filter select box
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<string[]>("/assignments/items/filter");
        setUniqueItems(data);
      } catch (err: any) {
        console.error("Failed to load unique items:", err);
      }
    })();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!filtersApplied) {
      setFilteredAssignments(assignments);
      return;
    }

    let filtered = [...assignments];

    // Filter by item (equipment type)
    if (filterItem) {
      filtered = filtered.filter(a => 
        a.item.toLowerCase().includes(filterItem.toLowerCase())
      );
    }

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(a => a.dateAssigned >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(a => a.dateAssigned <= filterEndDate);
    }

    setFilteredAssignments(filtered);
  }, [assignments, filterItem, filterStartDate, filterEndDate, filtersApplied]);

  // Apply filters function
  const applyFilters = () => {
    setFiltersApplied(true);
  };

  // Clear filters function
  const clearFilters = () => {
    setFilterItem("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFiltersApplied(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Base[]>("/bases");
        setBases(data);
      } catch (err: any) {
        // setError("Failed to fetch bases");
      }
    })();
  }, []);

  // Fetch available items when base location changes
  const fetchAvailableItems = async (baseLocation: string) => {
    if (!baseLocation) {
      setAvailableItems([]);
      setForm({ ...form, item: "" });
      return;
    }

    try {
      const { data } = await api.get<AvailableItem[]>("/assignments/items/available", {
        params: { baseLocation }
      });
      setAvailableItems(data);
    } catch (err: any) {
      console.error("Failed to fetch available items:", err);
      setAvailableItems([]);
    }
  };

  // Fetch personnel when base location changes
  const fetchPersonnel = async (baseLocation: string) => {
    if (!baseLocation) {
      setPersonnelList([]);
      setForm({ ...form, personnel: "" });
      return;
    }

    try {
      const { data } = await api.get<string[]>("/assignments/personnel/list", {
        params: { baseLocation }
      });
      setPersonnelList(data);
    } catch (err: any) {
      console.error("Failed to fetch personnel:", err);
      setPersonnelList([]);
    }
  };

  // Fetch data when base location changes
  useEffect(() => {
    fetchAvailableItems(form.baseLocation);
    fetchPersonnel(form.baseLocation);
  }, [form.baseLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError("");
    // setSuccess("");

    try {
      if (editingId) {
        await api.put(`/assignments/${editingId}`, form);
        // setSuccess("Assignment updated successfully!");
      } else {
        await api.post("/assignments", form);
        // setSuccess("Assignment created successfully!");
      }
      setForm({ baseLocation: "", item: "", personnel: "", quantity: 0, date: "" });
      setEditingId(null);
      setAvailableItems([]);
      setPersonnelList([]);
      fetchAssignments();
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to save assignment");
    }
  };

  const handleEdit = (a: Assignment) => {
    setForm({ baseLocation: a.baseLocation, item: a.item, personnel: a.personnel, quantity: a.quantity, date: a.dateAssigned });
    setEditingId(a.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/assignments/${id}`);
      // setSuccess("Assignment deleted successfully!");
      fetchAssignments();
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to delete assignment");
    }
  };

  const getBaseOptions = () => {
    const userRole = localStorage.getItem("role");
    const userBaseId = localStorage.getItem("baseId");
    
    if (userRole === "admin") {
      return bases;
    } else if (userRole === "base_commander" && userBaseId) {
      return bases.filter(b => b.id === Number(userBaseId));
    }
    return [];
  };

  const baseOptions = getBaseOptions();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Assignments</h1>
      
      {/* Success Message */}
      {/* {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )} */}

      {/* Error Message */}
      {/* {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Assignment" : "Create New Assignment"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Location</label>
            <CustomDropdown
              options={baseOptions.map((b) => ({ value: b.name, label: b.name }))}
              value={form.baseLocation}
              onChange={(value) => setForm({ ...form, baseLocation: value, item: "", personnel: "", quantity: 0, date: "" })}
              placeholder="Select Base Location"
              name="baseLocation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <CustomDropdown
              options={availableItems.map((item) => ({ 
                value: item.item, 
                label: `${item.item} (Available: ${item.available}, Assignable: ${item.assignable})` 
              }))}
              value={form.item}
              onChange={(value) => setForm({ ...form, item: value })}
              placeholder={!form.baseLocation 
                ? "Select base location first" 
                : availableItems.length === 0 
                ? "No items available" 
                : "Select item"}
              name="item"
              disabled={!form.baseLocation || availableItems.length === 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              min="1"
              required
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personnel</label>
            <CustomDropdown
              options={personnelList.map((person) => ({ value: person, label: person }))}
              value={form.personnel}
              onChange={(value) => setForm({ ...form, personnel: value })}
              placeholder={!form.baseLocation 
                ? "Select base location first" 
                : personnelList.length === 0 
                ? "No personnel available" 
                : "Select personnel"}
              name="personnel"
              disabled={!form.baseLocation || personnelList.length === 0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Assigned</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            {editingId ? "Update Assignment" : "Add Assignment"}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ baseLocation: "", item: "", personnel: "", quantity: 0, date: "" });
                setAvailableItems([]);
                setPersonnelList([]);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Loading assignments...</div>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Assignment History</h2>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-md font-medium mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
                <CustomDropdown
                  options={uniqueItems.map((itemName) => ({ value: itemName, label: itemName }))}
                  value={filterItem}
                  onChange={setFilterItem}
                  placeholder="All Items"
                  name="filterItem"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Assigned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {a.baseLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {a.personnel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(a.dateAssigned).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAssignments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No assignments found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
