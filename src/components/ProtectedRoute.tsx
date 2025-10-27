import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    isAdmin: boolean,
    children: ReactNode
}
const ProtectedRoute = ({ isAdmin, children }: ProtectedRouteProps) => {
  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
