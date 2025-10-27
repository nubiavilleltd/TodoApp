import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { fetchAllTodos, deleteTodo } from "../api/sharepoint";
import type { TodoItem } from "../types";

export const AdminTodoList: React.FC = () => {
  const { getAccessToken } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Failed to get token");

        const data = await fetchAllTodos(token);
        setTodos(data);
      } catch (err) {
        console.error("Error fetching todos:", err);
        setError("Failed to load todos");
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [getAccessToken]);

  const handleDelete = async (id: string) => {
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Failed to get token");

      await deleteTodo(token, id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo");
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-gray-400">Loading all tasks...</div>
    );

  if (error)
    return (
      <div className="text-center py-12 text-red-400">{error}</div>
    );

  return (
    <div className="space-y-3">
      {todos.map((todo, index) => (
        <div
          key={todo.id || `todo-${index}`}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-semibold text-white">
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-gray-400 text-sm">{todo.description}</p>
              )}
              <p className="text-xs text-gray-500">
                Created by: <span className="text-blue-400">{todo.author?.title || "-"}</span>
              </p>
              <p className="text-xs text-gray-500">
                Approver: <span className="text-purple-400">{todo.approver?.title || "—"}</span>
              </p>
            </div>

            <button
              onClick={() => handleDelete(todo.id)}
              className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
