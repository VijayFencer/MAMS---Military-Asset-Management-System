import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import CustomDropdown from "../components/CustomDropdown";

type Purchase = {
  id: number;
  item: string;
  quantity: number;
  price: number;
  date: string;        // yyyy-mm-dd (from backend)
  location: string;    // location is required in the model
  created_at?: string; // Sequelize with underscored: true
  updated_at?: string; // Sequelize with underscored: true
};

type Base = { id: number; name: string };

const API = "/purchases";

// Currency formatter (INR)
const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

const PurchasesPage: React.FC = () => {
  // add form
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [baseId, setBaseId] = useState<string>(localStorage.getItem("baseId") || "");
  const [bases, setBases] = useState<Base[]>([]);

  // list state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const role = typeof window !== "undefined" ? (localStorage.getItem("role") || "") : "";
  const canMutate = role === "admin" || role === "base_commander";
  const canCreate = role === "admin" || role === "base_commander";
  const isBaseCommander = role === "base_commander";

  // edit modal state
  const [editing, setEditing] = useState<Purchase | null>(null);

  // delete confirm state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // filter state
  const [filterItem, setFilterItem] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [uniqueItems, setUniqueItems] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Load purchases
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Purchase[]>(API);
        setPurchases(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load unique items for filter select box
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<string[]>(`${API}/items/filter`);
        setUniqueItems(data);
      } catch (err: any) {
        console.error("Failed to load unique items:", err);
      }
    })();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!filtersApplied) {
      setFilteredPurchases(purchases);
      return;
    }

    let filtered = [...purchases];

    // Filter by item (equipment type)
    if (filterItem) {
      filtered = filtered.filter(p => 
        p.item.toLowerCase().includes(filterItem.toLowerCase())
      );
    }

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(p => p.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(p => p.date <= filterEndDate);
    }

    setFilteredPurchases(filtered);
  }, [purchases, filterItem, filterStartDate, filterEndDate, filtersApplied]);

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
        
        // For base commanders, automatically set their base and don't allow changes
        if (isBaseCommander) {
          const userBaseId = localStorage.getItem("baseId");
          if (userBaseId) {
            setBaseId(userBaseId);
          }
        } else if (!baseId && data.length > 0) {
          setBaseId(String(data[0].id));
        }
      } catch {}
    })();
  }, [isBaseCommander]);

  // Add purchase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !quantity || !price || !baseId) return;

    const payload = {
      item,
      quantity: Number(quantity),
      price: Number(price),
      baseId: Number(baseId),
      date: new Date().toISOString().slice(0, 10),
    };

    try {
      const { data: created } = await api.post<Purchase>(API, payload);
      setPurchases((prev) => [created, ...prev]);
      setItem("");
      setQuantity("");
      setPrice("");
      // keep selected base
    } catch (err: any) {
      alert(err.message || "Failed to add");
    }
  };

  // Open edit modal
  const openEdit = (row: Purchase) => setEditing(row);

  // Save edit
  const saveEdit = async () => {
    if (!editing) return;
    const { id, item, quantity, price, date, location } = editing;
    try {
      const { data: updated } = await api.put<Purchase>(`${API}/${id}`, { item, quantity, price, date, location });
      setPurchases((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setEditing(null);
    } catch (err: any) {
      alert(err.message || "Failed to update");
    }
  };

  // Confirm delete
  const confirmDelete = (id: number) => setDeletingId(id);

  // Do delete
  const doDelete = async () => {
    if (deletingId == null) return;
    try {
      await api.delete(`${API}/${deletingId}`);
      setPurchases((prev) => prev.filter((p) => p.id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  // Totals
  const totalAmount = useMemo(
    () => filteredPurchases.reduce((sum, p) => sum + p.quantity * p.price, 0),
    [filteredPurchases]
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Add Form */}
      {canCreate && (
      <form
  onSubmit={handleSubmit}
  className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100 space-y-4"
>
  <h2 className="text-lg font-semibold text-gray-900">Add Purchase</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <input
      type="text"
      placeholder="Item Name"
      value={item}
      onChange={(e) => setItem(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
      required
    />
    <input
      type="number"
      min={1}
      placeholder="Quantity"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
      required
    />
    <input
      type="number"
      min={0}
      step="0.01"
      placeholder="Price"
      value={price}
      onChange={(e) => setPrice(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
      required
    />
    <CustomDropdown
      options={bases.map((b) => ({ value: b.id.toString(), label: b.name }))}
      value={baseId}
      onChange={setBaseId}
      placeholder="Select Base"
      name="baseId"
      disabled={isBaseCommander}
    />
  </div>
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      type="submit"
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
    >
      Add Purchase
    </button>
  </div>
  {isBaseCommander && (
    <p className="text-sm text-gray-600">
      Base selection is locked to your assigned base: {bases.find(b => b.id === Number(baseId))?.name}
    </p>
  )}
 </form>
      )}


      {/* Table */}
      <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Purchase History</h2>
          <div className="text-sm flex flex-col sm:flex-row gap-2 sm:gap-4">
            <span>
              Records: <b>{filteredPurchases.length}</b>
            </span>
            <span>
              Total: <b>{formatINR(totalAmount)}</b>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium mb-3 text-gray-900">Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors text-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No purchases recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm lg:text-base">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Date</th>
                  <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Item</th>
                  <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Quantity</th>
                  <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Price</th>
                  <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Total</th>
                  <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Location</th>
                  {canMutate && <th className="p-2 lg:p-3 border text-xs lg:text-sm font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2 lg:p-3 border text-xs lg:text-sm">
                      {p.date ? new Date(p.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-2 lg:p-3 border text-xs lg:text-sm">{p.item}</td>
                    <td className="p-2 lg:p-3 border text-xs lg:text-sm">{p.quantity}</td>
                    <td className="p-2 lg:p-3 border text-xs lg:text-sm">{formatINR(p.price)}</td>
                    <td className="p-2 lg:p-3 border text-xs lg:text-sm">
                      {formatINR(p.quantity * p.price)}
                    </td>
                    <td className="p-2 lg:p-3 border text-xs lg:text-sm">{p.location}</td>
                    {canMutate && (
                      <td className="p-2 lg:p-3 border">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="px-2 lg:px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(p.id)}
                            className="px-2 lg:px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="p-2 lg:p-3 border text-xs lg:text-sm" colSpan={4}>
                    Grand Total
                  </td>
                  <td className="p-2 lg:p-3 border text-xs lg:text-sm">{formatINR(totalAmount)}</td>
                  <td className="p-2 lg:p-3 border" colSpan={canMutate ? 2 : 1}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {canMutate && editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Purchase</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editing.item}
                onChange={(e) =>
                  setEditing({ ...editing, item: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Item"
              />
              <input
                type="number"
                min={1}
                value={editing.quantity}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    quantity: Number(e.target.value || 0),
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Quantity"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={editing.price}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    price: Number(e.target.value || 0),
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Price"
              />
              <input
                type="text"
                value={editing.location || ""}
                onChange={(e) =>
                  setEditing({ ...editing, location: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Location"
              />
              <input
                type="date"
                value={
                  editing.date
                    ? new Date(editing.date).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setEditing({ ...editing, date: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {canMutate && deletingId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Delete Purchase</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this purchase? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={doDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;
