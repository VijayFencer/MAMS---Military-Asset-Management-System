import React, { useEffect, useState } from "react";
import api from "../services/api";
import CustomDropdown from "../components/CustomDropdown";

interface Transfer {
  id: number;
  sourceLocation: string;
  destinationLocation: string;
  item: string;
  quantity: number;
  date: string;
}

type Base = { id: number; name: string };

interface StockInfo {
  item: string;
  baseId: number;
  currentStock: number;
}

interface AvailableItem {
  item: string;
  available: number;
}

const TransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [bases, setBases] = useState<Base[]>([]);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [checkingStock, setCheckingStock] = useState(false);
  const [form, setForm] = useState({
    sourceBaseId: "",
    destinationBaseId: "",
    item: "",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
  } as any);
  const [editingId, setEditingId] = useState<number | null>(null);

  // filter state
  const [filterItem, setFilterItem] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([]);
  const [uniqueItems, setUniqueItems] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Transfer[]>("/transfers");
      setTransfers(data);
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to fetch transfers"); // Removed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  // Load unique items for filter select box
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<string[]>("/transfers/items/filter");
        setUniqueItems(data);
      } catch (err: any) {
        console.error("Failed to load unique items:", err);
      }
    })();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!filtersApplied) {
      setFilteredTransfers(transfers);
      return;
    }

    let filtered = [...transfers];

    // Filter by item (equipment type)
    if (filterItem) {
      filtered = filtered.filter(t => 
        t.item.toLowerCase().includes(filterItem.toLowerCase())
      );
    }

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(t => t.date >= filterStartDate);
    }
    if (filterEndDate) {
      filtered = filtered.filter(t => t.date <= filterEndDate);
    }

    setFilteredTransfers(filtered);
  }, [transfers, filterItem, filterStartDate, filterEndDate, filtersApplied]);

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
        // setError("Failed to fetch bases"); // Removed
      }
    })();
  }, []);

  // Fetch available items when source base changes
  const fetchAvailableItems = async (baseId: string) => {
    if (!baseId) {
      setAvailableItems([]);
      setForm({ ...form, item: "" });
      return;
    }

    try {
      const { data } = await api.get<AvailableItem[]>("/transfers/items/available", {
        params: { baseId }
      });
      setAvailableItems(data);
    } catch (err: any) {
      console.error("Failed to fetch available items:", err);
      setAvailableItems([]);
    }
  };

  // Real-time stock validation
  const checkStockAvailability = async () => {
    if (!form.sourceBaseId || !form.item || !form.quantity) {
      setStockInfo(null);
      return;
    }

    try {
      setCheckingStock(true);
      const { data } = await api.get<StockInfo>("/transfers/stock/current", {
        params: {
          baseId: form.sourceBaseId,
          item: form.item
        }
      });
      setStockInfo(data);
    } catch (err: any) {
      console.error("Stock check failed:", err);
      setStockInfo(null);
    } finally {
      setCheckingStock(false);
    }
  };

  // Check stock when source base, item, or quantity changes
  useEffect(() => {
    const timeoutId = setTimeout(checkStockAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [form.sourceBaseId, form.item, form.quantity]);

  // Fetch available items when source base changes
  useEffect(() => {
    fetchAvailableItems(form.sourceBaseId);
  }, [form.sourceBaseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that source and destination bases are different
    if (form.sourceBaseId === form.destinationBaseId) {
      return;
    }

    try {
      if (editingId) {
        await api.put(`/transfers/${editingId}`, form);
      } else {
        await api.post("/transfers", form);
      }
             setForm({ 
         sourceBaseId: "", 
         destinationBaseId: "", 
         item: "", 
         quantity: 1, 
         date: new Date().toISOString().split("T")[0] 
       });
       setEditingId(null);
       setStockInfo(null);
       setAvailableItems([]);
       fetchTransfers();
    } catch (e: any) {
      console.error("Transfer operation failed:", e);
    }
  };

  const handleEdit = (transfer: Transfer) => {
    // Find the source base ID from the transfer data
    const sourceBase = bases.find(b => b.name === transfer.sourceLocation);
    const destinationBase = bases.find(b => b.name === transfer.destinationLocation);
    
    setForm({
      sourceBaseId: sourceBase ? sourceBase.id.toString() : "",
      destinationBaseId: destinationBase ? destinationBase.id.toString() : "",
      item: transfer.item,
      quantity: transfer.quantity,
      date: transfer.date,
    });
    setEditingId(transfer.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/transfers/${id}`);
      // setSuccess("Transfer deleted successfully!"); // Removed
      fetchTransfers();
    } catch (err: any) {
      // setError(err?.response?.data?.error || "Failed to delete transfer"); // Removed
    }
  };

  const getSourceBaseOptions = () => {
    const userRole = localStorage.getItem("role");
    const userBaseId = localStorage.getItem("baseId");
    
    if (userRole === "admin") {
      return bases;
    } else if (userRole === "base_commander" && userBaseId) {
      return bases.filter(b => b.id === Number(userBaseId));
    }
    return [];
  };

  const getDestinationBaseOptions = () => {
    // Filter out the source base from destination options
    if (!form.sourceBaseId) {
      return bases;
    }
    return bases.filter(b => b.id !== Number(form.sourceBaseId));
  };

  const role = localStorage.getItem("role") || "";
  const canCreate = role === "admin" || role === "base_commander";
  const isStockSufficient = stockInfo && stockInfo.currentStock >= form.quantity;
  const sourceBaseOptions = getSourceBaseOptions();
  const destinationBaseOptions = getDestinationBaseOptions();
  const remainingAfterTransfer = stockInfo ? stockInfo.currentStock - form.quantity : 0;
  


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Transfers</h1>

      {/* Success Message */}
      {/* Removed Success Message */}

      {/* Error Message */}
      {/* Removed Error Message */}

      {/* Form */}
      {canCreate && (
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded mb-6">
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Transfer" : "Create New Transfer"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Base</label>
            <CustomDropdown
              options={sourceBaseOptions.map((b) => ({ value: b.id.toString(), label: b.name }))}
              value={form.sourceBaseId}
              onChange={(value) => setForm({ 
                ...form, 
                sourceBaseId: value, 
                destinationBaseId: "", // Clear destination when source changes
                item: "" 
              })}
              placeholder="Select Source Base"
              name="sourceBaseId"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Base</label>
            <CustomDropdown
              options={destinationBaseOptions.map((b) => ({ value: b.id.toString(), label: b.name }))}
              value={form.destinationBaseId}
              onChange={(value) => setForm({ ...form, destinationBaseId: value })}
              placeholder={!form.sourceBaseId ? "Select source base first" : "Select Destination Base"}
              name="destinationBaseId"
              disabled={!form.sourceBaseId}
            />
            {form.sourceBaseId && (
              <p className="text-xs text-gray-500 mt-1">
                Source base automatically excluded from destination options
              </p>
            )}
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
              placeholder={!form.sourceBaseId 
                ? "Select source base first" 
                : availableItems.length === 0 
                ? "No items available" 
                : "Select item"}
              name="item"
              disabled={!form.sourceBaseId || availableItems.length === 0}
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

        {/* Stock Information - Simplified */}
        {stockInfo && (
          <div className={`p-4 rounded-lg border ${
            isStockSufficient ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className="font-medium mb-2">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Stock:</span>
                <span className={`ml-2 ${isStockSufficient ? 'text-green-600' : 'text-red-600'}`}>
                  {stockInfo.currentStock}
                </span>
              </div>
              <div>
                <span className="font-medium">Requested:</span>
                <span className="ml-2">{form.quantity}</span>
              </div>
              <div>
                <span className="font-medium">Remaining After Transfer:</span>
                <span className={`ml-2 ${isStockSufficient ? 'text-green-600' : 'text-red-600'}`}>
                  {remainingAfterTransfer}
                </span>
              </div>
            </div>
            {!isStockSufficient && (
              <p className="text-red-600 text-sm mt-2">
                ⚠️ Insufficient stock for this transfer
              </p>
            )}
          </div>
        )}

        <div className="flex gap-3">
                     <button
             type="submit"
             disabled={!isStockSufficient || checkingStock}
             className={`px-4 py-2 rounded font-medium transition-colors ${
               isStockSufficient && !checkingStock
                 ? 'bg-green-600 text-white hover:bg-green-700'
                 : 'bg-gray-400 text-gray-200 cursor-not-allowed'
             }`}
           >
            {checkingStock ? "Checking Stock..." : (editingId ? "Update Transfer" : "Create Transfer")}
          </button>
          
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  sourceBaseId: "",
                  destinationBaseId: "",
                  item: "",
                  quantity: 1,
                  date: new Date().toISOString().split("T")[0],
                });
                setStockInfo(null);
                setAvailableItems([]);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-lg">Loading transfers...</div>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Transfer History</h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  {canCreate && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {t.sourceLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.destinationLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    {canCreate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransfers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transfers found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
