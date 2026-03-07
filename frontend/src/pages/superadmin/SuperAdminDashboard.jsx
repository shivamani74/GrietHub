import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

  const [eventSearch, setEventSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  
  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get("/superadmin/dashboard");
      setDashboard(data);
    } catch {
      toast.error("Failed to load dashboard");
    }
  };

 
  const fetchAdmins = async () => {
    try {
      const { data } = await axios.get("/superadmin/admins");
      setAdmins(data);
    } catch {
      toast.error("Failed to load admins");
    }
  };

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchAdmins()]).finally(() =>
      setLoading(false)
    );
  }, []);


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  
  const revokeAdmin = async (id) => {
    const confirm = window.confirm(
      "Are you sure? This admin will lose all privileges."
    );
    if (!confirm) return;

    setRevokingId(id);
    try {
      await axios.post(`/superadmin/revoke-admin/${id}`);
      toast.success("Admin role revoked");
      fetchAdmins();
      fetchDashboard();
    } catch {
      toast.error("Failed to revoke admin");
    } finally {
      setRevokingId(null);
    }
  };

  
  const downloadCSV = async (eventId, title) => {
    try {
      const { data } = await axios.get(
        `/superadmin/events/${eventId}/registrations`
      );

      if (!data.length) {
        toast.info("No registrations yet");
        return;
      }

      const headers = [
        "Name",
        "Roll No",
        "Email",
        "Phone",
        "Amount",
      ];

      const rows = data.map((r) => [
        r.user?.name,
        r.user?.rollNo,
        r.user?.email,
        r.user?.phone,
        r.payment?.amount || 0,
      ]);

      const csv =
        headers.join(",") +
        "\n" +
        rows.map((r) => r.join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}-registrations.csv`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("CSV download failed");
    }
  };

 
  const filteredEvents = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.events.filter((e) =>
      e.title.toLowerCase().includes(eventSearch.toLowerCase())
    );
  }, [dashboard, eventSearch]);

  const filteredAdmins = useMemo(() => {
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
        a.email.toLowerCase().includes(adminSearch.toLowerCase())
    );
  }, [admins, adminSearch]);

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-extrabold text-[#7A1CAC]">
            🛡️ SuperAdmin Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        <div
          onClick={() => navigate("/superadmin/verify-admins")}
          className="cursor-pointer bg-zinc-950 border border-zinc-800
                     rounded-2xl p-6 mb-12 hover:bg-zinc-900"
        >
          <h2 className="text-xl font-bold text-zinc-100">
            🛂 Admin Requests
          </h2>

          <p className="text-zinc-400 mt-2">
            Pending:{" "}
            <span className="text-red-400 font-bold">
              {dashboard.pendingAdminCount}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#7A1CAC]">
            📅 Events
          </h2>

          <input
            placeholder="Search events..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            className="input w-64"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-zinc-100">
                {event.title}
              </h3>

              <p className="text-zinc-400 text-sm">
                Club: {event.clubName}
              </p>

              <p className="text-zinc-400 text-sm">
                Registrations:{" "}
                <span className="text-[#7A1CAC] font-semibold">
                  {event.registrationCount}
                </span>
              </p>

              <p className="text-zinc-400 text-sm">
                Revenue: ₹{event.revenue}
              </p>

              <button
                onClick={() =>
                  downloadCSV(event._id, event.title)
                }
                className="mt-4 px-4 py-2 text-sm rounded-lg
                           bg-[#7A1CAC] text-black hover:scale-[1.05]"
              >
                Download CSV
              </button>
            </div>
          ))}
        </div>

        {/* ADMINS */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#7A1CAC]">
            👥 Existing Admins
          </h2>

          <input
            placeholder="Search admins..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="input w-64"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAdmins.map((admin) => (
            <div
              key={admin._id}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-zinc-100">
                {admin.name}
              </h3>

              <p className="text-zinc-400 text-sm">
                {admin.email}
              </p>

              <p className="text-zinc-400 text-sm">
                Club: {admin.adminVerification?.clubName}
              </p>

              <button
                disabled={revokingId === admin._id}
                onClick={() => revokeAdmin(admin._id)}
                className="mt-4 px-4 py-2 rounded-lg text-sm
                           bg-red-600 text-white hover:bg-red-700
                           disabled:opacity-60"
              >
                Revoke Admin
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
