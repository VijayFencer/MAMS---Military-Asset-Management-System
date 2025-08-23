import React, { useEffect, useState } from "react";
import api from "../services/api";

type UserProfile = {
  id: number;
  username: string;
  role: string;
  base_id: number | null;
  base?: {
    id: number;
    name: string;
    code: string;
    location: string;
  };
  created_at: string;
  updated_at: string;
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found. Please login again.");
        return;
      }
      const { data } = await api.get(`/auth/profile/${userId}`);
      setProfile(data);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err?.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "base_commander":
        return "Base Commander";
      case "logistics":
        return "Logistics Manager";
      default:
        return role;
    }
  };



  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No profile data available.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">User Profile</h1>
          <p className="text-green-100">Account Information</p>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Username</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-gray-900 font-medium">{profile.username}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleDisplayName(profile.role)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">User ID</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    <span className="text-gray-900 font-mono text-sm">{profile.id}</span>
                  </div>
                </div>
              </div>
            </div>

                         {/* Base Assignment - Only show for non-admin users */}
             {profile.role !== "admin" && (
               <div className="space-y-4">
                 <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                   Base Assignment
                 </h2>
                 
                 <div className="space-y-3">
                   {profile.base ? (
                     <>
                       <div>
                         <label className="block text-sm font-medium text-gray-600">Base Name</label>
                         <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                           <span className="text-gray-900 font-medium">{profile.base.name}</span>
                         </div>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-gray-600">Base Code</label>
                         <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                           <span className="text-gray-900 font-mono">{profile.base.code}</span>
                         </div>
                       </div>

                       <div>
                         <label className="block text-sm font-medium text-gray-600">Location</label>
                         <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                           <span className="text-gray-900">{profile.base.location}</span>
                         </div>
                       </div>
                     </>
                   ) : (
                     <div>
                       <label className="block text-sm font-medium text-gray-600">Base Assignment</label>
                       <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                         <span className="text-gray-500 italic">No base assigned</span>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>

          

          

          
        </div>
      </div>
    </div>
  );
};

export default Profile;
