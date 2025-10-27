import React, { useState } from "react";
import { AdminTodoList } from "../components/AdminTodoList";
import { AdminManager } from "../components/AdminManager";
import { useNavigate } from "react-router-dom";

export const Admin: React.FC = () => {
  const [tab, setTab] = useState<"todos" | "admins">("todos");
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/", { replace: true })}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          Home
        </button>
        <button
          onClick={() => setTab("todos")}
          className={`px-4 py-2 rounded-lg ${
            tab === "todos"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          All Todos
        </button>
        <button
          onClick={() => setTab("admins")}
          className={`px-4 py-2 rounded-lg ${
            tab === "admins"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Manage Admins
        </button>
      </div>

      {tab === "todos" ? <AdminTodoList /> : <AdminManager />}
    </div>
  );
};
