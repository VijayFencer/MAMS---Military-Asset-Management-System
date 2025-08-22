import React, { useEffect, useState } from "react";
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

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-green-700">
          MAMS
        </div>
        <nav className="flex-1 p-4 space-y-3">
          {navigationItems.map((item) => (
            item.roles.includes(role) && (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path ? "bg-green-600" : "hover:bg-green-700"
                }`}
              >
                {item.name}
              </button>
            )
          ))}
          {isAdmin && (
            <button
              onClick={() => navigate("/register")}
              className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                location.pathname === "/register" ? "bg-green-600" : "hover:bg-green-700"
              }`}
            >
              Register User
            </button>
          )}
        </nav>
        
        <div className="p-4 border-t border-green-700">
          <div className="text-sm text-green-200">
            <div className="font-medium">MAMS System</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </div>
          <div className="text-gray-600 flex items-center gap-3">
            <span>Welcome</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 underline"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {children}
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
