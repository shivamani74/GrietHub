import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

const ViewEventStats = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  
  const fetchRegistrations = async () => {
    try {
      const { data } = await axios.get(
        `/admin/event/${eventId}/registrations`
      );
      setRegistrations(data);
    } catch {
      toast.error("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  
  const filteredRegistrations = useMemo(() => {
    if (!search) return registrations;

    const q = search.toLowerCase();
    return registrations.filter(
      (r) =>
        r.user?.name?.toLowerCase().includes(q) ||
        r.user?.rollNo?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.user?.phone?.includes(q)
    );
  }, [search, registrations]);

  
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let checkedIn = 0;
    let paidNotCheckedIn = 0;

    registrations.forEach((r) => {
      if (r.status === "checked_in") checkedIn++;

      if (r.status === "paid") paidNotCheckedIn++;

      if (
        (r.status === "paid" || r.status === "checked_in") &&
        r.payment?.amount
      ) {
        totalRevenue += Number(r.payment.amount);
      }
    });

    return {
      totalRegistrations: registrations.length,
      checkedIn,
      notCheckedIn: registrations.length - checkedIn,
      paidNotCheckedIn,
      totalRevenue,
    };
  }, [registrations]);

  
  const downloadCSV = () => {
    if (filteredRegistrations.length === 0) {
      toast.info("No data to download");
      return;
    }

    const headers = ["Name", "Roll No", "Email", "Phone", "Status"];

    const rows = filteredRegistrations.map((r) => [
      r.user?.name || "",
      r.user?.rollNo || "",
      r.user?.email || "",
      r.user?.phone || "",
      r.status,
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-registrations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg
                       bg-zinc-800 text-zinc-300
                       hover:bg-zinc-700 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold text-[#7A1CAC]">
            📊 Event Statistics
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Registrations" value={stats.totalRegistrations} />
          <StatCard title="Checked-in" value={stats.checkedIn} color="green" />
          <StatCard title="Not Checked-in" value={stats.notCheckedIn} color="red" />
          <StatCard title="Paid (Not Entered)" value={stats.paidNotCheckedIn} color="yellow" />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} color="green" />
        </div>

        
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search name / roll / email / phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input max-w-sm"
          />

          <button
            onClick={downloadCSV}
            className="px-4 py-2 rounded-lg
                       bg-green-600 text-white
                       hover:bg-green-700 transition"
          >
            📤 Download CSV
          </button>
        </div>

       
        {filteredRegistrations.length === 0 ? (
          <p className="text-zinc-400">No registrations found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-zinc-800 rounded-lg">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="p-3 text-left text-zinc-400">Name</th>
                  <th className="p-3 text-left text-zinc-400">Roll No</th>
                  <th className="p-3 text-left text-zinc-400">Email</th>
                  <th className="p-3 text-left text-zinc-400">Phone</th>
                  <th className="p-3 text-left text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-zinc-800 hover:bg-zinc-900 transition"
                  >
                    <td className="p-3 text-zinc-200">{r.user?.name}</td>
                    <td className="p-3 text-zinc-300">{r.user?.rollNo}</td>
                    <td className="p-3 text-zinc-300">{r.user?.email}</td>
                    <td className="p-3 text-zinc-300">{r.user?.phone || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          r.status === "checked_in"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-yellow-600/20 text-yellow-400"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color = "zinc" }) => {
  const colors = {
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
    zinc: "text-zinc-300",
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-extrabold ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
};

export default ViewEventStats;
