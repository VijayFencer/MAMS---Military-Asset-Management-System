import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import PurchasesPage from "./pages/PurchasesPage";
import TransfersPage from "./pages/TransfersPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import ExpendituresPage from "./pages/ExpendituresPage";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || "";
  const isAdmin = role === "admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("baseId");
    localStorage.removeItem("baseName");
    navigate("/login");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    return path.charAt(1).toUpperCase() + path.slice(2);
  };

  const navigationItems = [
    { name: "Dashboard", path: "/", roles: ["admin", "base_commander", "logistics"] },
    { name: "Purchases", path: "/purchases", roles: ["admin", "base_commander", "logistics"] },
    { name: "Transfers", path: "/transfers", roles: ["admin", "base_commander", "logistics"] },
    { name: "Assignments", path: "/assignments", roles: ["admin", "base_commander"] },
    { name: "Expenditures", path: "/expenditures", roles: ["admin", "base_commander"] },
    { name: "Profile", path: "/profile", roles: ["admin", "base_commander", "logistics"] }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-green-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 text-2xl font-bold border-b border-green-700 flex items-center justify-between">
          <span>MAMS</span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-green-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            item.roles.includes(role) && (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`block w-full text-left px-3 py-3 rounded-lg transition-colors text-sm lg:text-base ${
                  location.pathname === item.path ? "bg-green-600" : "hover:bg-green-700"
                }`}
              >
                {item.name}
              </button>
            )
          ))}
          {isAdmin && (
            <button
              onClick={() => handleNavigation("/register")}
              className={`block w-full text-left px-3 py-3 rounded-lg transition-colors text-sm lg:text-base ${
                location.pathname === "/register" ? "bg-green-600" : "hover:bg-green-700"
              }`}
            >
              Register User
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-green-700">
          <div className="text-xs lg:text-sm text-green-200">
            <div className="font-medium">MAMS System</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
          
          <div className="text-gray-600 flex items-center gap-2 lg:gap-3 text-sm lg:text-base">
            <span className="hidden sm:inline">Welcome</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 underline text-sm lg:text-base"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/purchases" element={
          <ProtectedRoute>
            <Layout>
              <PurchasesPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/transfers" element={
          <ProtectedRoute>
            <Layout>
              <TransfersPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/assignments" element={
          <ProtectedRoute>
            <Layout>
              <AssignmentsPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/expenditures" element={
          <ProtectedRoute>
            <Layout>
              <ExpendituresPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
