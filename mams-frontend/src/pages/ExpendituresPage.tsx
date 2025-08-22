// src/pages/ExpendituresPage.tsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import CustomDropdown from "../components/CustomDropdown";

interface Expenditure {
  id: number;
  item: string;
  quantity: number;
  baseLocation: string;
  reason?: string;
  date: string;
}

interface AvailableItem {
  item: string;
  available: number;
}

type Base = { id: number; name: string };

const ExpendituresPage: React.FC = () => {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [bases, setBases] = useState<Base[]>([]);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    baseLocation: "",
    item: "",
    quantity: 0,
    date: "",
    reason: "",
  });

  // filter state
  const [filterItem, setFilterItem] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredExpenditures, setFilteredExpenditures] = useState<Expenditure[]>([]);
  const [uniqueItems, setUniqueItems] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const fetchExps = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Expenditure[]>("/expenditures");
      setExpenditures(data);
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to fetch expenditures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchExps(); 
  }, []);

  // Load unique items for filter select box
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<string[]>("/expenditures/items/filter");
        setUniqueItems(data);
      } catch (err: any) {
        console.error("Failed to load unique items:", err);
      }
    })();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!filtersApplied) {
      setFilteredExpenditures(expenditures);
      return;
    }

    let filtered = [...expenditures];

    // Filter by item (equipment type)
    if (filterItem) {
      filtered = filtered.filter(e => 
        e.item.toLowerCase().includes(filterItem.toLowerCase())
      );
    }

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(e => e.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(e => e.date <= filterEndDate);
    }

    setFilteredExpenditures(filtered);
  }, [expenditures, filterItem, filterStartDate, filterEndDate, filtersApplied]);

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
      const { data } = await api.get<AvailableItem[]>("/expenditures/items/available", {
        params: { baseLocation }
      });
      setAvailableItems(data);
    } catch (err: any) {
      console.error("Failed to fetch available items:", err);
      setAvailableItems([]);
    }
  };

  // Fetch data when base location changes
  useEffect(() => {
    fetchAvailableItems(form.baseLocation);
  }, [form.baseLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError("");
    // setSuccess("");

    try {
      if (editingId) {
        await api.put(`/expenditures/${editingId}`, form);
        // setSuccess("Expenditure updated successfully!");
      } else {
        await api.post("/expenditures", form);
        // setSuccess("Expenditure created successfully!");
      }
      setForm({ baseLocation: "", item: "", quantity: 0, date: "", reason: "" });
      setEditingId(null);
      setAvailableItems([]);
      fetchExps();
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to save expenditure");
    }
  };

  const handleEdit = (a: Expenditure) => {
    setForm({ item: a.item, quantity: a.quantity, baseLocation: a.baseLocation, reason: a.reason || "", date: a.date });
    setEditingId(a.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenditures/${id}`);
      // setSuccess("Expenditure deleted successfully!");
      fetchExps();
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to delete expenditure");
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
      <h1 className="text-2xl font-bold mb-4">Expenditures</h1>
      
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
          {editingId ? "Edit Expenditure" : "Create New Expenditure"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Location</label>
            <CustomDropdown
              options={baseOptions.map((b) => ({ value: b.name, label: b.name }))}
              value={form.baseLocation}
              onChange={(value) => setForm({ ...form, baseLocation: value, item: "" })}
              placeholder="Select Base Location"
              name="baseLocation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <CustomDropdown
              options={availableItems.map((item) => ({ 
                value: item.item, 
                label: `${item.item} (Available: ${item.available})` 
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
            <input
              type="text"
              placeholder="Enter reason for expenditure"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
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
            {editingId ? "Update Expenditure" : "Add Expenditure"}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ baseLocation: "", item: "", quantity: 0, date: "", reason: "" });
                setAvailableItems([]);
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
          <div className="text-lg">Loading expenditures...</div>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Expenditure History</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenditures.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {e.baseLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {e.item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {e.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {e.reason || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(e)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
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
          {filteredExpenditures.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No expenditures found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpendituresPage;
