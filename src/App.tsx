import React, { useEffect, useState } from "react";
import { TodoBoard } from "./pages/TodoBoard";
import NotFound from "./pages/NotFound";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./auth/AuthProvider";
import { checkIfAdmin } from "./api/sharepoint";
import ProtectedRoute from "./components/ProtectedRoute";
import { Admin } from "./pages/Admin";

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { getAccessToken, account } = useAuth();

  useEffect(() => {
    const init = async () => {
      const token = await getAccessToken();
      if (!token || !account) return;

      const admin = await checkIfAdmin(token, account?.username);
      setIsAdmin(admin);
    };

    init();
  }, [account]);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element: <TodoBoard />,
        },
        {
          path: "admin",
          element: (
            <ProtectedRoute isAdmin={isAdmin}>
              <Admin />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
