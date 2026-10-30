import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import LinksVault from "./pages/LinksVault";
import RDLab from "./pages/RDLab";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import Orders from "./pages/orders";
import Franchise from "./pages/Franchise";
import Finance from "./pages/finance";
import Reports from "./pages/reports";
import SOPs from "./pages/SOPs";
import Suppliers from "./pages/Suppliers";
import Team from "./pages/team";
import Notes from "./pages/Notes"; // NEW

function ProtectedRoute({ children }: { children: any }) {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/links" element={<ProtectedRoute><LinksVault /></ProtectedRoute>} />
          <Route path="/rnd" element={<ProtectedRoute><RDLab /></ProtectedRoute>} />
          <Route path="/production" element={<ProtectedRoute><Production /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/sops" element={<ProtectedRoute><SOPs /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
          <Route path="/franchise" element={<ProtectedRoute><Franchise /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;