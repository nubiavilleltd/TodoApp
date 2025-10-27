import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  fetchAdmins,
  addAdmin,
  deleteAdmin,
  searchUsers,
} from "../api/sharepoint";
import type { SharePointUser } from "../types";

export const AdminManager: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<SharePointUser | null>(
    null
  );
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SharePointUser[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmins = async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Failed to get token");

      const data = await fetchAdmins(token);
      setAdmins(data);
      setLoading(false);
    };
    loadAdmins();
  }, [getAccessToken]);

  // Search users
  useEffect(() => {
    const search = async () => {
      if (userSearch.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) return;
        const results = await searchUsers(token, userSearch);
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [userSearch, getAccessToken]);

  const handleAdd = async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("Failed to get token");
    if (!selectedAdmin) throw new Error("Invalid Admin Selected")

    // You’ll need to resolve the user email to SharePoint userId using ensureUser API
    // const res = await fetch(
    //   `https://nubiaville.sharepoint.com/_api/web/ensureuser('${selectedAdmin?.EMail}')`,
    //   {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       Accept: "application/json;odata=verbose",
    //     },
    //   }
    // );
    // const userData = await res.json();
    // const userId = userData.d.Id;

    await addAdmin(token, selectedAdmin?.Id);
    const refreshed = await fetchAdmins(token);
    setAdmins(refreshed);
    setSelectedAdmin(null)
    setUserSearch("")
    setSearchResults([])
  };

  const handleDelete = async (id: number) => {
    const token = await getAccessToken();
    if (!token) throw new Error("Failed to get token");

    await deleteAdmin(token, id);
    setAdmins(admins.filter((a) => a.Id !== id));
  };

  if (loading)
    return <p className="text-gray-400 text-center py-8">Loading admins...</p>;

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <input
          value={userSearch}
          onChange={(e) => {
            setUserSearch(e.target.value);
            setShowUserDropdown(true);
          }}
          onFocus={() => setShowUserDropdown(true)}
          placeholder="Enter user email..."
          className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
        />
        {showUserDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 w-100 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.Id}
                onClick={() => {
                  setSelectedAdmin(user);
                  setUserSearch(user.Title);
                  setShowUserDropdown(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
              >
                <p className="text-white font-medium">{user.Title}</p>
                <p className="text-xs text-gray-400">{user.EMail}</p>
              </button>
            ))}
          </div>
        )}
        {selectedAdmin && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <span className="text-blue-400 text-sm">
                  ✓ {selectedAdmin.Title}
                </span>
                <button
                  onClick={() => {
                    setSelectedAdmin(null);
                    setUserSearch("");
                  }}
                  className="ml-auto text-blue-400 hover:text-blue-300"
                >
                  ✕
                </button>
              </div>
            )}
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Admin
        </button>
      </div>

      <div className="space-y-2">
        {admins.map((a) => (
          <div
            key={a.Id}
            className="flex justify-between items-center bg-gray-800/50 border border-gray-700 rounded-lg p-3"
          >
            <span className="text-white">
              {a.User?.Title} ({a.User?.EMail})
            </span>
            <button
              onClick={() => handleDelete(a.Id)}
              className="px-3 py-1 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
