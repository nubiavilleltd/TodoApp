import { useEffect, useState, useRef } from "react";
import type { TodoItem, SharePointUser } from "../types";
import {
  createTodo,
  uploadFile,
  searchUsers,
  updateTodo,
} from "../api/sharepoint";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

interface TodoFormProps {
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  getAccessToken: () => Promise<string | null>;
  request?: TodoItem | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  todos: TodoItem[];
  rid: string | null;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>
}

function TodoForm({
  setTodos,
  getAccessToken,
  setError,
  todos,
  request,
  rid,
  setShowForm
}: TodoFormProps) {
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApprover, setSelectedApprover] =
    useState<SharePointUser | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SharePointUser[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { account } = useAuth();
  const [isRequestOwner, setIsRequestOwner] = useState(false);
  const [isGetItemRequest, setIsGetItemRequest] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    if (rid && request) {
      setNewTodo({
        title: request.title,
        description: request.description || "",
      });

      if (request.approver) {
        setSelectedApprover({
          Id: Number(request.approver.id),
          Title: request.approver.title,
          EMail: request.approver.email,
        });
        setUserSearch(request.approver.title);
      } else {
        setSelectedApprover(null);
        setUserSearch("");
      }
    }
  }, [rid, request]);

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

  useEffect(() => {
    console.log(request, account?.username);
    if (
      request?.author?.email &&
      account?.username &&
      request.author?.email.toLowerCase() === account.username.toLowerCase()
    ) {
        console.log(true)
      setIsRequestOwner(true);
    } else {
        console.log(false)
      setIsRequestOwner(false);
    }
  }, [request, account]);

  const generateID = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleAddTodo = async () => {
    if (!newTodo.title.trim()) return;

    setUploading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Failed to get access token");
        return;
      }

      let imageUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(token, selectedFile);
      }

      const createdTodo = await createTodo(token, {
        id: generateID(),
        title: newTodo.title,
        description: newTodo.description,
        status: "Pending",
        imagePath: imageUrl,
        approver: selectedApprover
          ? {
              id: selectedApprover.Id.toString(),
              title: selectedApprover.Title,
              email: selectedApprover.EMail,
            }
          : undefined,
        approvalStatus: "Pending Approval"
      });

      setTodos([...todos, createdTodo]);
      setNewTodo({ title: "", description: "" });
      setSelectedFile(null);
      setSelectedApprover(null);
      setUserSearch("");
      setShowForm((prev) => !prev); 
      navigate("/", { replace: true })
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error creating todo:", err);
      setError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateTodo = async () => {
    if (!newTodo.title.trim()) return;

    if (!rid) {
      setError("Missing record ID for update");
      setUploading(false);
      return;
    }

    setUploading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Failed to get access token");
        return;
      }

      let imageUrl: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(token, selectedFile);
      }

      const updatedTodo = await updateTodo(token, rid, {
        title: newTodo.title,
        description: newTodo.description,
        status: "Pending",
        imagePath: imageUrl,
        approver: selectedApprover
          ? {
              id: selectedApprover.Id.toString(),
              title: selectedApprover.Title,
              email: selectedApprover.EMail,
            }
          : undefined,
      });

      setTodos(todos.map((t) => (t.id === rid ? { ...t, ...updatedTodo } : t)));
      setSelectedFile(null);
      setSelectedApprover(null);
      setUserSearch("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error updating todo:", err);
      setError(err instanceof Error ? err.message : "Failed to update todo");
    } finally {
      setUploading(false);
    }
  };



  if (rid && !isRequestOwner) {
    setIsGetItemRequest(true)
  }

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">➕</span>{" "}
          {request ? "Update" : "Create New"} Task
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Task title..."
            value={newTodo.title}
            readOnly={isGetItemRequest}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder-gray-500"
          />
          <textarea
            placeholder="Add a description..."
            value={newTodo.description}
            readOnly={isGetItemRequest}
            onChange={(e) =>
              setNewTodo({ ...newTodo, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder-gray-500 resize-none"
            rows={3}
          />

          {/* File Upload */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Attachment</label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                disabled={isGetItemRequest}
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 file:cursor-pointer"
              />
              {selectedFile && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {selectedFile && (
              <p className="text-xs text-gray-400">
                Selected: {selectedFile.name}
              </p>
            )}
            {request?.imagePath && (
              <p className="text-sm text-gray-400">
                Existing file Path: {request.imagePath}
              </p>
            )}
          </div>

          {/* People Picker */}
          <div className="space-y-2 relative">
            <label className="block text-sm text-gray-400">Approver</label>
            <input
              type="text"
              placeholder="Search for user..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setShowUserDropdown(true);
              }}
              readOnly={isGetItemRequest}
              onFocus={() => setShowUserDropdown(true)}
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder-gray-500"
            />
            {showUserDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.Id}
                    onClick={() => {
                      setSelectedApprover(user);
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
            {selectedApprover && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <span className="text-blue-400 text-sm">
                  ✓ {selectedApprover.Title}
                </span>
                <button
                  onClick={() => {
                    setSelectedApprover(null);
                    setUserSearch("");
                  }}
                  className={`ml-auto text-blue-400 hover:text-blue-300 ${
                    isGetItemRequest ? "hidden" : ""
                  }`}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {!isGetItemRequest && (
            <button
              onClick={request ? handleUpdateTodo : handleAddTodo}
              disabled={!newTodo.title.trim() || uploading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-[1.02] disabled:scale-100"
            >
              {uploading
                ? request
                  ? "Updating..."
                  : "Creating..."
                : request
                ? "Update Task"
                : "Create Task"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default TodoForm;
