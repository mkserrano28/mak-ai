import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("makai_access_token");

      if (!token) {
        setAuthenticated(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("makai_access_token");

          localStorage.removeItem("makai_user");

          setAuthenticated(false);
          return;
        }

        const user = await response.json();

        localStorage.setItem("makai_user", JSON.stringify(user));

        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      }
    };

    checkAuthentication();
  }, []);

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Loading Mak-AI...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
