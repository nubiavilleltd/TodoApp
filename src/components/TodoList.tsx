// import React from "react";
// import type { TodoItem, TodoStatus } from "../types";
// import { useAuth } from "../auth/AuthProvider";
// import { deleteTodo, updateTodo } from "../api/sharepoint";

// interface TodoListProps {
//   loading: boolean;
//   todos: TodoItem[];
//   setError: React.Dispatch<React.SetStateAction<string | null>>;
//   setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
// }

// export const TodoList: React.FC<TodoListProps> = ({
//   loading,
//   todos,
//   setError,
//   setTodos,
// }) => {
//   const { getAccessToken } = useAuth();

//   const handleUpdateStatus = async (id: string, newStatus: string) => {
//     try {
//       const token = await getAccessToken();
//       if (!token) {
//         setError("Failed to get access token");
//         return;
//       }

//       const updatedTodo = await updateTodo(token, id, {
//         status: newStatus as TodoStatus,
//       });

//       setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
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

//   if (loading) {
//     return (
//       <div className="text-center py-12">
//         <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//         <p className="mt-4 text-gray-400">Loading tasks...</p>
//       </div>
//     );
//   }

//   if (todos.length === 0) {
//     return (
//       <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
//         <p className="text-gray-400 text-lg">No tasks yet. Create your first one!</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-3">
//       {todos.map((todo) => (
//         <div
//           key={todo.id}
//           className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all group"
//         >
//           <div className="flex items-start justify-between gap-4">
//             <div className="flex-1 space-y-2">
//               <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
//                 {todo.title}
//               </h3>

//               {todo.description && (
//                 <p className="text-gray-400 text-sm leading-relaxed">
//                   {todo.description}
//                 </p>
//               )}

//               <div className="flex flex-wrap gap-2 items-center">
//                 {/* Status badge */}
//                 <span
//                   className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
//                     todo.status === "Completed"
//                       ? "bg-green-500/20 text-green-400 border border-green-500/30"
//                       : todo.status === "In Progress"
//                       ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
//                       : "bg-gray-700/50 text-gray-300 border border-gray-600"
//                   }`}
//                 >
//                   <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
//                   {todo.status}
//                 </span>

//                 {/* Approver */}
//                 {todo.approver && (
//                   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
//                     👤 {todo.approver.title}
//                   </span>
//                 )}

//                 {/* Approval status */}
//                 <span
//                   className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
//                     todo.approvalStatus === "Approved"
//                       ? "bg-green-500/20 text-green-400 border border-green-500/30"
//                       : todo.approvalStatus === "Rejected"
//                       ? "bg-red-500/20 text-red-400 border border-red-500/30"
//                       : "bg-gray-700/50 text-yellow-300 border border-yellow-600"
//                   }`}
//                 >
//                   <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
//                   {todo.approvalStatus}
//                 </span>

//                 {/* Attachment */}
//                 {todo.imagePath && (
//                   <a
//                     href={`https://nubiaville.sharepoint.com${todo.imagePath}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
//                   >
//                     📎 Attachment
//                   </a>
//                 )}
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex gap-2">
//               <select
//                 disabled={todo.approvalStatus !== "Approved"}
//                 value={todo.status}
//                 onChange={(e) => handleUpdateStatus(todo.id, e.target.value)}
//                 className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white hover:border-gray-600 focus:border-blue-500 outline-none transition-all disabled:cursor-not-allowed"
//               >
//                 <option value="Pending">Pending</option>
//                 <option value="In Progress">In Progress</option>
//                 <option value="Completed">Completed</option>
//               </select>

//               <button
//                 onClick={() => handleDelete(todo.id)}
//                 className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
import React from "react";
import type { TodoItem, TodoStatus } from "../types";
import { useAuth } from "../auth/AuthProvider";
import { deleteTodo, updateTodo } from "../api/sharepoint";
import { useNavigate } from "react-router-dom";

interface TodoListProps {
  loading: boolean;
  todos: TodoItem[];
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
}

export const TodoList: React.FC<TodoListProps> = ({
  loading,
  todos,
  setError,
  setTodos,
}) => {
  const { getAccessToken, account } = useAuth();
  const navigate = useNavigate();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Failed to get access token");
        return;
      }

      const updatedTodo = await updateTodo(token, id, {
        status: newStatus as TodoStatus,
      });

      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  // Separate sections
  const approvalTodos = todos.filter(
    (t) => t.approver?.email === account?.username && t.approvalStatus !== 'Approved'
  );

  const myTodos = todos.filter(
    (t) => !approvalTodos.some((a) => a.id === t.id)
  );

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
        <p className="text-gray-400 text-lg">
          No tasks yet. Create your first one!
        </p>
      </div>
    );
  }

  const renderTodoCard = (todo: TodoItem, clickable = false) => (
    <div
      key={todo.id}
      onClick={() => clickable && navigate(`?rid=${todo.id}`)}
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 transition-all group ${
        clickable
          ? "cursor-pointer hover:border-blue-500 hover:bg-gray-800/70"
          : "hover:border-gray-600"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3
            className={`text-lg font-semibold transition-colors ${
              clickable
                ? "text-blue-400 group-hover:text-blue-300"
                : "text-white group-hover:text-blue-400"
            }`}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p className="text-gray-400 text-sm leading-relaxed">
              {todo.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {/* Status badge */}
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

            {/* Approver */}
            {todo.approver && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                👤 {todo.approver.title}
              </span>
            )}

            {/* Approval status */}
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                todo.approvalStatus === "Approved"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : todo.approvalStatus === "Rejected"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-gray-700/50 text-yellow-300 border border-yellow-600"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {todo.approvalStatus}
            </span>

            {/* Attachment */}
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

        {/* Actions */}
        {!clickable && (
          <div className="flex gap-2">
            <select
              disabled={todo.approvalStatus !== "Approved"}
              value={todo.status}
              onChange={(e) => handleUpdateStatus(todo.id, e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white hover:border-gray-600 focus:border-blue-500 outline-none transition-all disabled:cursor-not-allowed"
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
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* My Todos */}
      {myTodos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">My Tasks</h2>
          <div className="space-y-3">
            {myTodos.map((t) => renderTodoCard(t))}
          </div>
        </section>
      )}

      {/* Todos Awaiting My Approval */}
      {approvalTodos.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">
            Awaiting My Approval
          </h2>
          <div className="space-y-3">
            {approvalTodos.map((t) => renderTodoCard(t, true))}
          </div>
        </section>
      )}

      {/* If neither exist */}
      {myTodos.length === 0 && approvalTodos.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-2xl border border-gray-700">
          <p className="text-gray-400 text-lg">
            No tasks assigned or awaiting approval.
          </p>
        </div>
      )}
    </div>
  );
};
