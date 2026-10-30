import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (location.pathname === "/login") return null;
  if (!isLoggedIn) return null;

  const linkClass = (path: string) =>
    `hover:text-white ${location.pathname===path? "text-white font-bold" : ""}`;

  return (
    <nav className="flex flex-wrap justify-between items-center px-6 py-3 bg-black text-white sticky top-0 z-50 gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/" className="font-black tracking-widest">BELVERA HQ</Link>
        <div className="flex flex-wrap gap-3 text-sm text-gray-300">
          <Link to="/" className={linkClass("/")}>Dashboard</Link>
          <Link to="/links" className="hover:text-white text-yellow-300 font-bold">Links Vault ⭐</Link>
          <Link to="/rnd" className={linkClass("/rnd")}>R&D Lab</Link>
          <Link to="/production" className={linkClass("/production")}>Production</Link>
          <Link to="/inventory" className={linkClass("/inventory")}>Inventory</Link>
          <Link to="/orders" className={linkClass("/orders")}>Orders</Link>
          <Link to="/suppliers" className={linkClass("/suppliers")}>Suppliers</Link>
          <Link to="/sops" className={linkClass("/sops")}>SOP Library</Link>
          <Link to="/team" className={linkClass("/team")}>Team</Link>
          <Link to="/franchise" className={linkClass("/franchise")}>Franchise</Link>
          <Link to="/finance" className={linkClass("/finance")}>Finance</Link>
          <Link to="/reports" className={linkClass("/reports")}>Reports</Link>
          <Link to="/notes" className={`${linkClass("/notes")} bg-white/10 px-2 py-1 rounded`}>📝 Notes</Link>
        </div>
      </div>
      <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-medium">Logout</button>
    </nav>
  );
}