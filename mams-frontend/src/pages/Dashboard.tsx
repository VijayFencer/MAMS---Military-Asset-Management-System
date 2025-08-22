import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import CustomDropdown from "../components/CustomDropdown";

type Base = { id: number; name: string };
type Summary = {
  opening: number;
  purchases: number;
  transferIn: number;
  transferOut: number;
  assigned: number;
  expended: number;
  closing: number;
  netMovement: number;
};

interface DetailedMovement {
  purchases: Array<{ item: string; quantity: number; date: string; base: string }>;
  transfersIn: Array<{ item: string; quantity: number; date: string; fromBase: string; toBase: string }>;
  transfersOut: Array<{ item: string; quantity: number; date: string; fromBase: string; toBase: string }>;
}

const Dashboard: React.FC = () => {
  const [bases, setBases] = useState<Base[]>([]);
  const [baseId, setBaseId] = useState<string>(localStorage.getItem("baseId") || "");
  const [item, setItem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNetMovementPopup, setShowNetMovementPopup] = useState(false);
  const [detailedMovement, setDetailedMovement] = useState<DetailedMovement | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [availableItems, setAvailableItems] = useState<string[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const clearFilters = () => {
    setItem("");
    setStartDate("");
    setEndDate("");
    if (role === "admin") {
      setBaseId("");
    }
  };

  const role = useMemo(() => localStorage.getItem("role") || "", []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Base[]>("/bases");
        setBases(data);
      } catch {}
    })();
  }, []);

  const loadAvailableItems = async () => {
    try {
      setLoadingItems(true);
      const params: any = {};
      if (role === "admin" && baseId) {
        params.baseId = Number(baseId);
      }
      
      const { data: purchases } = await api.get<any[]>("/purchases", { params });
      const purchaseItems = [...new Set(purchases.map((p: any) => p.item))] as string[];
      
      const { data: transfers } = await api.get<any[]>("/transfers", { params });
      const transferItems = [...new Set(transfers.map((t: any) => t.item))] as string[];
      
      const allItems = [...new Set([...purchaseItems, ...transferItems])].sort();
      setAvailableItems(allItems);
    } catch (e: any) {
      console.error("Failed to load available items:", e);
      setAvailableItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadAvailableItems();
  }, [baseId, role]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (item) params.item = item;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (role === "admin" && baseId) params.baseId = Number(baseId);
      const { data } = await api.get<Summary>("/dashboard/summary", { params });
      setSummary(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [baseId, item, startDate, endDate, role]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBaseOptions = () => {
    if (role === "admin") {
      return bases;
    }
    return [];
  };

  const loadDetailedMovement = async () => {
    try {
      setLoadingDetails(true);
      const params: any = {};
      if (item) params.item = item;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (role === "admin" && baseId) params.baseId = Number(baseId);
      
      const [purchasesRes, transfersRes] = await Promise.all([
        api.get<any[]>("/purchases", { params }),
        api.get<any[]>("/transfers", { params })
      ]);

      // Use the same base logic as the dashboard summary
      let userBaseId = null;
      let userBaseName = "Unknown Base";
      
      if (role === "admin" && baseId) {
        // Admin with selected base
        userBaseId = baseId;
        const selectedBase = bases.find(b => b.id.toString() === baseId);
        userBaseName = selectedBase?.name || "Unknown Base";
      } else if (role !== "admin") {
        // Non-admin uses their assigned base
        userBaseId = localStorage.getItem("baseId");
        userBaseName = localStorage.getItem("baseName") || "Unknown Base";
      }
      


      // Since the API already filtered by base, categorize transfers based on source/destination
      const transfersIn = transfersRes.data.filter((t: any) => {
        // Transfers where current base is the destination
        const destinationLocation = t.destinationLocation || t.destination_location || t.to_location || t.toLocation;
        const destinationBaseId = t.destination_base_id || t.destinationBaseId || t.to_base_id || t.toBaseId;
        
        // If we have base info, use it; otherwise assume all transfers are "in" for this base
        if (userBaseId && userBaseName !== "Unknown Base") {
          const isDestinationMatch = destinationLocation === userBaseName || 
                                   destinationBaseId === Number(userBaseId) || 
                                   destinationBaseId === userBaseId;
          

          
          return isDestinationMatch;
        } else {

          return true;
        }
      });

      const transfersOut = transfersRes.data.filter((t: any) => {
        // Transfers where current base is the source
        const sourceLocation = t.sourceLocation || t.source_location || t.from_location || t.fromLocation;
        const sourceBaseId = t.source_base_id || t.sourceBaseId || t.from_base_id || t.fromBaseId;
        
        // If we have base info, use it; otherwise show all transfers as "out"
        if (userBaseId && userBaseName !== "Unknown Base") {
          const isSourceMatch = sourceLocation === userBaseName || 
                              sourceBaseId === Number(userBaseId) || 
                              sourceBaseId === userBaseId;
          

          
          return isSourceMatch;
        } else {

          return true;
        }
      });

      const detailedData: DetailedMovement = {
        purchases: purchasesRes.data.map((p: any) => ({
          item: p.item,
          quantity: p.quantity,
          date: p.date,
          base: p.base?.name || p.location || userBaseName
        })),
        transfersIn: transfersIn.map((t: any) => ({
          item: t.item,
          quantity: t.quantity,
          date: t.date,
          fromBase: t.sourceLocation || t.source_location || "Unknown",
          toBase: t.destinationLocation || t.destination_location || userBaseName
        })),
        transfersOut: transfersOut.map((t: any) => ({
          item: t.item,
          quantity: t.quantity,
          date: t.date,
          fromBase: t.sourceLocation || t.source_location || userBaseName,
          toBase: t.destinationLocation || t.destination_location || "Unknown"
        }))
      };


      
      setDetailedMovement(detailedData);
    } catch (e: any) {
      console.error("Failed to load detailed movement:", e);
      // Set empty data if API fails
      setDetailedMovement({
        purchases: [],
        transfersIn: [],
        transfersOut: []
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle net movement hover
  const handleNetMovementHover = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Calculate center position of the card
    let x = rect.left + rect.width / 2;
    let y = rect.bottom + 20; // Add more space below the card
    
    // Calculate popup dimensions - increased size
    const popupWidth = Math.min(windowWidth * 0.98, 1200); // 98% of screen width, max 1200px
    const popupHeight = Math.min(windowHeight * 0.9, 800); // 90% of screen height, max 800px
    
    // Adjust horizontal position to keep popup within viewport
    if (x + popupWidth / 2 > windowWidth) {
      x = windowWidth - popupWidth / 2 - 20; // 20px margin from right edge
    }
    if (x - popupWidth / 2 < 0) {
      x = popupWidth / 2 + 20; // 20px margin from left edge
    }
    
    // Adjust vertical position
    if (y + popupHeight > windowHeight) {
      // If popup would go below viewport, show it above the card
      y = rect.top - popupHeight - 20;
    }
    
    // Ensure popup doesn't go above viewport
    if (y < 20) {
      y = 20;
    }
    
    setPopupPosition({ x, y });
    setShowNetMovementPopup(true);
    loadDetailedMovement();
  };

  // Remove the handleNetMovementLeave function - popup will stay until X is clicked

  // Metric Card Component
  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: { value: number; isPositive: boolean };
    onHover?: (e: React.MouseEvent) => void;
    onClick?: (e: React.MouseEvent) => void;
  }> = ({ title, value, icon, color, trend, onHover, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative cursor-pointer"
      onMouseEnter={onHover}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <svg className={`w-4 h-4 ml-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d={trend.isPositive ? "M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" : "M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"} clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Loading Skeleton Component
  const MetricSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

  // Net Movement Popup Component
  const NetMovementPopup: React.FC = () => {
    if (!showNetMovementPopup) return null;

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowNetMovementPopup(false)}
        />
        
        {/* Popup */}
        <div 
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-6"
          style={{ 
            left: `${popupPosition.x}px`, 
            top: `${popupPosition.y}px`,
            transform: 'translateX(-50%)',
            width: '98vw',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Net Movement Details</h3>
          <button 
            onClick={() => setShowNetMovementPopup(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Loading details...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Purchases */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                Purchases ({detailedMovement?.purchases.length || 0})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {detailedMovement?.purchases.map((purchase, index) => (
                  <div key={index} className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-medium text-sm">{purchase.item}</div>
                    <div className="text-xs text-gray-600">
                      Qty: {purchase.quantity} | Date: {new Date(purchase.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Base: {purchase.base}</div>
                  </div>
                ))}
                {(!detailedMovement?.purchases || detailedMovement.purchases.length === 0) && (
                  <div className="text-sm text-gray-500 italic">No purchases recorded</div>
                )}
              </div>
            </div>

            {/* Transfers In */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Transfers In ({detailedMovement?.transfersIn.length || 0})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {detailedMovement?.transfersIn.map((transfer, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-sm">{transfer.item}</div>
                    <div className="text-xs text-gray-600">
                      Qty: {transfer.quantity} | Date: {new Date(transfer.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      From: {transfer.fromBase} → To: {transfer.toBase}
                    </div>
                  </div>
                ))}
                {(!detailedMovement?.transfersIn || detailedMovement.transfersIn.length === 0) && (
                  <div className="text-sm text-gray-500 italic">No transfers in recorded</div>
                )}
              </div>
            </div>

            {/* Transfers Out */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Transfers Out ({detailedMovement?.transfersOut.length || 0})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-3">
                {detailedMovement?.transfersOut.map((transfer, index) => (
                  <div key={index} className="bg-red-50 p-3 rounded-lg">
                    <div className="font-medium text-sm">{transfer.item}</div>
                    <div className="text-xs text-gray-600">
                      Qty: {transfer.quantity} | Date: {new Date(transfer.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      From: {transfer.fromBase} → To: {transfer.toBase}
                    </div>
                  </div>
                ))}
                {(!detailedMovement?.transfersOut || detailedMovement.transfersOut.length === 0) && (
                  <div className="text-sm text-gray-500 italic">No transfers out recorded</div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Net Movement Popup */}
      <NetMovementPopup />

      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your inventory and financial metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSummary}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Equipment Type</label>
            <div className="relative">
              <CustomDropdown
                options={availableItems.map((itemName) => ({ value: itemName, label: itemName }))}
                value={item}
                onChange={setItem}
                placeholder="All Items"
                name="item"
                disabled={loadingItems}
              />
              {loadingItems && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white"
            />
          </div>
          
          {role === "admin" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Base</label>
              <CustomDropdown
                options={getBaseOptions().map((b) => ({ value: b.id.toString(), label: b.name }))}
                value={baseId}
                onChange={setBaseId}
                placeholder="All Bases"
                name="baseId"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">&nbsp;</label>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {loading ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            {/* Opening Balance */}
            <MetricCard
              title="Opening Balance"
              value={summary ? formatNumber(summary.opening) : "0"}
              icon="💰"
              color="bg-blue-500"
            />

            {/* Closing Balance */}
            <MetricCard
              title="Closing Balance"
              value={summary ? formatNumber(summary.closing) : "0"}
              icon="💳"
              color="bg-green-500"
            />

            {/* Purchases */}
            <MetricCard
              title="Purchases"
              value={summary ? formatNumber(summary.purchases) : "0"}
              icon="🛒"
              color="bg-purple-500"
            />

            {/* Net Movement */}
            <MetricCard
              title="Net Movement"
              value={summary ? formatNumber(summary.netMovement) : "0"}
              icon="📈"
              color="bg-orange-500"
              onHover={handleNetMovementHover}
              onClick={handleNetMovementHover}
            />

            {/* Total Expenditure */}
            <MetricCard
              title="Total Expenditure"
              value={summary ? formatNumber(summary.expended) : "0"}
              icon="📤"
              color="bg-red-500"
            />
          </>
        )}
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfers Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📥</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Transfers In</p>
                  <p className="text-sm text-gray-600">Items received</p>
                </div>
              </div>
              <span className="text-xl font-bold text-green-600">
                {summary ? formatNumber(summary.transferIn) : "0"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📤</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Transfers Out</p>
                  <p className="text-sm text-gray-600">Items sent</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-600">
                {summary ? formatNumber(summary.transferOut) : "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Assignments Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Assigned Items</p>
                  <p className="text-sm text-gray-600">Currently assigned</p>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {summary ? formatNumber(summary.assigned) : "0"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Available for Assignment</p>
                  <p className="text-sm text-gray-600">Ready to assign</p>
                </div>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {summary ? formatNumber(summary.closing - summary.assigned) : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

