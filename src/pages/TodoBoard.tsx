import React, { useEffect, useState } from "react";
import type { TodoItem } from "../types";
import { useAuth } from "../auth/AuthProvider";
import { fetchTodos, fetchTodoById } from "../api/sharepoint";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TodoForm from "../components/TodoForm";
import ApprovalSection from "../components/ApproverSection";
import { TodoList } from "../components/TodoList";

export const TodoBoard: React.FC = () => {
  const { account, getAccessToken, signIn, signOut } = useAuth();
  const [todos, setTodos] = useState<Omit<TodoItem[], "approvalStatus">>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const [rid, setRid] = useState<string | null>(null);
  const [request, setRequest] = useState<TodoItem | null>(null);
  const [isApprover, setIsApprover] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ridParam = params.get("rid");
    if (ridParam) {
      setRid(ridParam);
      setShowForm(true);
    }
  }, [location.search]);

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

  useEffect(() => {
    const loadRequestTodo = async () => {
      if (!account) return;
      if (!rid) return;

      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          setError("Failed to get access token");
          return;
        }
        const data = await fetchTodoById(token, rid);

        if (
          data.approver?.email?.toLowerCase() ===
          account?.username?.toLowerCase()
        ) {
          setIsApprover(true);
        }
        setRequest(data);
      } catch (err) {
        console.error(`Error loading todo with id ${rid}:`, err);
        setError(
          err instanceof Error
            ? err.message
            : `Failed to load todo with id ${rid}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequestTodo();
  }, [rid, account, getAccessToken]);

  const handleApprovalChange = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setError("Failed to get access token");
        return;
      }
      await fetchTodos(token);
    } catch (err) {
      console.error("Error reloading todos:", err);
      setError(err instanceof Error ? err.message : "Failed to reload todo");
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
    <div className="min-h-screen text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome back,{" "}
              <span className="text-white font-medium">{account.name}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-sm"
            >
              Sign Out
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-sm"
            >
              Admin
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            navigate("/", { replace: true });
          }}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors text-sm"
        >
          {showForm ? "Show Todo List" : "Show Todo Form"}
        </button>

        {showForm && (
          <>
            <TodoForm
              setTodos={setTodos}
              getAccessToken={getAccessToken}
              request={request}
              setError={setError}
              todos={todos}
              rid={rid}
              setShowForm={setShowForm}
            />

            {request && isApprover && (
              <ApprovalSection
                requestId={request.id}
                currentStatus={request.approvalStatus ?? ""}
                onApprovalChange={handleApprovalChange}
                setShowForm={setShowForm}
              />
            )}
          </>
        )}

        {!showForm && (
          <TodoList
            loading={loading}
            todos={todos}
            setError={setError}
            setTodos={setTodos}
          />
        )}

        {/* Add New Todo Card */}
        {/*  */}

        {/* Approver section */}
        {/* */}

        {/* Tasks List */}
        {/* */}
      </div>
    </div>
  );
};
