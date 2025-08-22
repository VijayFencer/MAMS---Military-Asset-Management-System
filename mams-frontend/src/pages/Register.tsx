import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomDropdown from "../components/CustomDropdown";

type Base = { id: number; name: string };

const Register: React.FC<{ onSwitchToLogin?: () => void }> = ({ onSwitchToLogin }) => {
  const [bases, setBases] = useState<Base[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("logistics");
  const [baseId, setBaseId] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const isAdmin = Boolean(token && userRole === "admin");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Base[]>("/bases");
        setBases(data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (token && userRole === "admin") {
      api.get("/dashboard/summary").catch((error: any) => {
        if (error?.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      });
    }
  }, [token, userRole, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    
    try {
      const payload: any = { username, password };
      if (baseId) payload.baseId = Number(baseId);

      if (token && isAdmin) {
        try {
          await api.get("/dashboard/summary");
          payload.role = role;
          await api.post("/auth/users", payload);
        } catch (tokenError: any) {
          if (tokenError?.response?.status === 401) {
            localStorage.clear();
            setError("Session expired. Please login again.");
            return;
          }
          throw tokenError;
        }
      } else {
        await api.post("/auth/register", payload);
      }
      setMessage("User created successfully!");
      setUsername("");
      setPassword("");
      setRole("logistics");
      setBaseId("");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? "Create New User" : "Register Account"}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? "Add a new user to the system" : "Create your MAMS account"}
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-green-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-red-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {!isAdmin && token && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-yellow-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">
                  You are logged in but not as Admin. Only public registration is available.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <CustomDropdown
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "base_commander", label: "Base Commander" },
                    { value: "logistics", label: "Logistics" }
                  ]}
                  value={role}
                  onChange={setRole}
                  placeholder="Select role"
                  name="role"
                />
              </div>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <label htmlFor="baseId" className="block text-sm font-medium text-gray-700">
                  Base {role === "admin" ? "(Optional)" : "(Required)"}
                </label>
                <CustomDropdown
                  options={bases.map((b) => ({ value: b.id.toString(), label: b.name }))}
                  value={baseId}
                  onChange={setBaseId}
                  placeholder={role === "admin" ? "Select base (optional)" : "Select base (required)"}
                  name="baseId"
                />
              </div>
            )}

            {/* Base selection for unauthenticated users (logistics only) */}
            {!isAdmin && (
              <div className="space-y-2">
                <label htmlFor="baseId" className="block text-sm font-medium text-gray-700">
                  Base (Required)
                </label>
                <CustomDropdown
                  options={bases.map((b) => ({ value: b.id.toString(), label: b.name }))}
                  value={baseId}
                  onChange={setBaseId}
                  placeholder="Select base (required)"
                  name="baseId"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isAdmin && role !== "admin" && !baseId) || (!isAdmin && !baseId)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating user...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>{isAdmin ? "Create User" : "Register"}</span>
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">MAMS Management System</span>
            </div>
          </div>

          {/* Login Link */}
          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="font-medium text-green-600 hover:text-green-700 underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}

          {/* Login Link for unauthenticated users */}
          {!isAdmin && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-green-600 hover:text-green-700 underline transition-colors"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2025 MAMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;