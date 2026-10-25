
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser } = useContext(AuthContext);

  // User is not logged in
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // User does not have permission
  if (currentUser.role !== allowedRole) {
    if (currentUser.role === "Faculty") {
      return <Navigate to="/faculty/dashboard" replace />;
    }

    if (currentUser.role === "Student") {
      return <Navigate to="/student/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  // User is authorized
  return children;
}

export default ProtectedRoute;
