import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 gap-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center w-full justify-end">
              <div className="flex items-center w-full justify-end space-x-4">
                <span className="text-gray-700 w-full text-right">
                  Welcome, {user?.name || "User"}
                </span>
                <Button onClick={handleLogout} className="max-w-[120px]">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Welcome to your dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                <p className="text-gray-500">TODO</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
