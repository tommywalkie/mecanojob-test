import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AuthProvider, { useAuth } from "./context/AuthContext";

// Check if token exists directly - bypass the auth state which might not be initialized yet
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // First directly check localStorage for a token
  const hasStoredToken = localStorage.getItem("token") !== null;

  // Fall back to the context state only if no token in localStorage
  const { isAuthenticated } = useAuth();

  // If either condition is met, user is considered authenticated
  if (!hasStoredToken && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
