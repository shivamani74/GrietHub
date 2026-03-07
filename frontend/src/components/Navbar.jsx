import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const hideUserInfo =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/admin/signup";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (hideUserInfo || !user) {
    return (
      <nav className="w-full border-b border-zinc-800 bg-black px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-extrabold text-[#7A1CAC]"
        >
          GRIEThub
        </Link>
      </nav>
    );
  }

  return (
    <nav className="w-full border-b border-zinc-800 bg-black">
      <div className="px-6 py-4 flex items-center justify-between">

        <Link
          to="/events"
          className="text-2xl font-extrabold text-[#7A1CAC]"
        >
          GRIEThub
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {user.role !== "superadmin" && (
            <Link
              to="/events"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              Events
            </Link>
          )}

          {(user.role === "student" || user.role === "admin") && (
            <Link
              to="/my-registrations"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              My Registrations
            </Link>
          )}

          {user.role === "admin" && (
            <Link
              to="/manage-events"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              Manage Events
            </Link>
          )}

          {user.role === "superadmin" && (
            <Link
              to="/superadmin/dashboard"
              className="text-zinc-300 text-sm hover:text-white transition"
            >
              Dashboard
            </Link>
          )}

          <span className="text-zinc-300 text-sm">
            Hi,{" "}
            <span className="font-semibold text-white">
              {user.name}
            </span>
          </span>

          {user.role !== "student" && (
            <span
              className={`px-3 py-1 text-xs rounded-full font-semibold
              ${
                user.role === "superadmin"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-[#7A1CAC]/20 text-[#7A1CAC]"
              }`}
            >
              {user.role.toUpperCase()}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm
                       bg-zinc-800 text-zinc-300
                       hover:bg-zinc-700 transition"
          >
            Logout
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-zinc-300 text-2xl"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-4 space-y-4 border-t border-zinc-800">

          {user.role !== "superadmin" && (
            <Link
              to="/events"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              Events
            </Link>
          )}

          {(user.role === "student" || user.role === "admin") && (
            <Link
              to="/my-registrations"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              My Registrations
            </Link>
          )}

          {user.role === "admin" && (
            <Link
              to="/manage-events"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              Manage Events
            </Link>
          )}

          {user.role === "superadmin" && (
            <Link
              to="/superadmin/dashboard"
              onClick={() => setOpen(false)}
              className="block text-zinc-300 text-sm"
            >
              Dashboard
            </Link>
          )}

          <div className="text-zinc-300 text-sm">
            Hi,{" "}
            <span className="font-semibold text-white">
              {user.name}
            </span>
          </div>

          {user.role !== "student" && (
            <span
              className={`inline-block px-3 py-1 text-xs rounded-full font-semibold
              ${
                user.role === "superadmin"
                  ? "bg-red-600/20 text-red-400"
                  : "bg-[#7A1CAC]/20 text-[#7A1CAC]"
              }`}
            >
              {user.role.toUpperCase()}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sm
                       bg-zinc-800 text-zinc-300
                       hover:bg-zinc-700 transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
