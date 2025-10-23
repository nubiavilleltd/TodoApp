// import React, { useEffect, useState } from "react";
// import type { TodoItem, TodoStatus } from "../types";
// import { useAuth } from "../auth/AuthProvider";
// import {
//   fetchTodos,
//   createTodo,
//   updateTodo,
//   deleteTodo,
// } from "../api/sharepoint";

// export const TodoList: React.FC = () => {
//   const { account, getAccessToken, signIn, signOut } = useAuth();
//   const [todos, setTodos] = useState<TodoItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [newTodo, setNewTodo] = useState({ title: "", description: "" });

//   useEffect(() => {
//     const loadTodos = async () => {
//       if (!account) return;

//       setLoading(true);
//       setError(null);
//       try {
//         const token = await getAccessToken();
//         if (!token) {
//           setError("Failed to get access token");
//           return;
//         }
//         const data = await fetchTodos(token);
//         setTodos(data);
//       } catch (err) {
//         console.error("Error loading todos:", err);
//         setError(err instanceof Error ? err.message : "Failed to load todos");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadTodos();
//   }, [account, getAccessToken]);

//   const handleAddTodo = async () => {
//     if (!newTodo.title.trim()) return;

//     try {
//       const token = await getAccessToken();
//       if (!token) {
//         setError("Failed to get access token");
//         return;
//       }

//       const createdTodo = await createTodo(token, {
//         title: newTodo.title,
//         description: newTodo.description,
//         status: "Pending",
//       });

//       setTodos([...todos, createdTodo]);
//       setNewTodo({ title: "", description: "" });
//     } catch (err) {
//       console.error("Error creating todo:", err);
//       setError(err instanceof Error ? err.message : "Failed to create todo");
//     }
//   };

//   const handleUpdateStatus = async (id: string, newStatus: string) => {
//     try {
//       const token = await getAccessToken();
//       if (!token) {
//         setError("Failed to get access token");
//         return;
//       }

//       await updateTodo(token, id, { status: newStatus as TodoStatus });
//       setTodos(
//         todos.map((t) =>
//           t.id === id ? { ...t, status: newStatus as TodoStatus } : t
//         )
//       );
//     } catch (err) {
//       console.error("Error updating todo:", err);
//       setError(err instanceof Error ? err.message : "Failed to update todo");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       const token = await getAccessToken();
//       if (!token) {
//         setError("Failed to get access token");
//         return;
//       }

//       await deleteTodo(token, id);
//       setTodos(todos.filter((t) => t.id !== id));
//     } catch (err) {
//       console.error("Error deleting todo:", err);
//       setError(err instanceof Error ? err.message : "Failed to delete todo");
//     }
//   };

//   if (!account) {
//     return (
//       <div className="p-4 max-w-2xl mx-auto">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Todo App with SharePoint</h1>
//           <button
//             onClick={signIn}
//             className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
//           >
//             Sign in with Microsoft
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 max-w-2xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold">Your Todos</h2>
//           <p className="text-sm text-gray-600">
//             Hello, <span className="font-semibold">{account.name}</span>
//           </p>
//         </div>
//         <button
//           onClick={signOut}
//           className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//         >
//           Sign Out
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Add new todo form */}
//       <div className="mb-6 p-4 border rounded bg-gray-50">
//         <h3 className="font-bold mb-2">Add New Todo</h3>
//         <input
//           type="text"
//           placeholder="Title"
//           value={newTodo.title}
//           onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
//           className="w-full p-2 border rounded mb-2"
//         />
//         <textarea
//           placeholder="Description"
//           value={newTodo.description}
//           onChange={(e) =>
//             setNewTodo({ ...newTodo, description: e.target.value })
//           }
//           className="w-full p-2 border rounded mb-2"
//           rows={3}
//         />
//         <button
//           onClick={handleAddTodo}
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//         >
//           Add Todo
//         </button>
//       </div>

//       {loading ? (
//         <p className="text-center py-8">Loading todos...</p>
//       ) : todos.length === 0 ? (
//         <p className="text-center text-gray-500 py-8">
//           No todos yet. Add one above!
//         </p>
//       ) : (
//         <ul className="space-y-3">
//           {todos.map((todo) => (
//             <li key={todo.id} className="border p-4 rounded shadow-sm bg-white">
//               <div className="flex justify-between items-start mb-2">
//                 <strong className="text-lg">{todo.title}</strong>
//                 <div className="flex gap-2">
//                   <select
//                     value={todo.status}
//                     onChange={(e) =>
//                       handleUpdateStatus(todo.id, e.target.value)
//                     }
//                     className="text-sm border rounded px-2 py-1"
//                   >
//                     <option value="Pending">Pending</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Completed">Completed</option>
//                   </select>
//                   <button
//                     onClick={() => handleDelete(todo.id)}
//                     className="text-red-600 hover:text-red-800 text-sm px-2"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//               {todo.description && (
//                 <p className="text-gray-600 text-sm">{todo.description}</p>
//               )}
//               <span
//                 className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
//                   todo.status === "Completed"
//                     ? "bg-green-100 text-green-800"
//                     : todo.status === "In Progress"
//                     ? "bg-yellow-100 text-yellow-800"
//                     : "bg-gray-100 text-gray-800"
//                 }`}
//               >
//                 {todo.status}
//               </span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };
import React, { useEffect, useState, useRef } from "react";
import type { TodoItem, TodoStatus, SharePointUser } from "../types";
import { useAuth } from "../auth/AuthProvider";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  uploadFile,
  searchUsers,
} from "../api/sharepoint";

export const TodoList: React.FC = () => {
  const { account, getAccessToken, signIn, signOut } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApprover, setSelectedApprover] = useState<SharePointUser | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SharePointUser[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadTodos = async () => {
      if (!account) return;

      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          setError("Failed to get access token");
          return;
        }
        const data = await fetchTodos(token);
        setTodos(data);
      } catch (err) {
        console.error("Error loading todos:", err);
        setError(err instanceof Error ? err.message : "Failed to load todos");
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [account, getAccessToken]);

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

      setTodos([...todos, createdTodo]);
      setNewTodo({ title: "", description: "" });
      setSelectedFile(null);
      setSelectedApprover(null);
      setUserSearch("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error creating todo:", err);
      setError(err instanceof Error ? err.message : "Failed to create todo");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Failed to get access token");
        return;
      }

      await updateTodo(token, id, { status: newStatus as TodoStatus });
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, status: newStatus as TodoStatus } : t
        )
      );
    } catch (err) {
      console.error("Error updating todo:", err);
      setError(err instanceof Error ? err.message : "Failed to update todo");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Failed to get access token");
        return;
      }

      await deleteTodo(token, id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError(err instanceof Error ? err.message : "Failed to delete todo");
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-gray-400 text-lg">
              Streamline your workflow with SharePoint
            </p>
          </div>
          <button
            onClick={signIn}
            className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg shadow-blue-500/25"
          >
            Sign in with Microsoft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back, <span className="text-white font-medium">{account.name}</span>
            </p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Add New Todo Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">➕</span> Create New Task
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title..."
              value={newTodo.title}
              onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white placeholder-gray-500"
            />
            <textarea
              placeholder="Add a description..."
              value={newTodo.description}
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
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
                <p className="text-xs text-gray-400">Selected: {selectedFile.name}</p>
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
                  <span className="text-blue-400 text-sm">✓ {selectedApprover.Title}</span>
                  <button
                    onClick={() => {
                      setSelectedApprover(null);
                      setUserSearch("");
                    }}
                    className="ml-auto text-blue-400 hover:text-blue-300"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleAddTodo}
              disabled={!newTodo.title.trim() || uploading}
              className="w-full py-3 rounded-xl bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-[1.02] disabled:scale-100"
            >
              {uploading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
            <p className="text-gray-400 text-lg">No tasks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {todo.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          todo.status === "Completed"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : todo.status === "In Progress"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-gray-700/50 text-gray-300 border border-gray-600"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {todo.status}
                      </span>

                      {todo.approver && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          👤 {todo.approver.title}
                        </span>
                      )}

                      {todo.imagePath && (
                        <a
                          href={`https://nubiaville.sharepoint.com${todo.imagePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                        >
                          📎 Attachment
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={todo.status}
                      onChange={(e) => handleUpdateStatus(todo.id, e.target.value)}
                      className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white hover:border-gray-600 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};