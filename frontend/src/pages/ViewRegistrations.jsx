import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const AUTO_REFRESH_INTERVAL = 5000;

const ViewRegistrations = () => {
  const { eventId } = useParams();

  const [registrations, setRegistrations] = useState([]);
  const [searchRoll, setSearchRoll] = useState("");
  const [entryFilter, setEntryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRegistrations = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://griethub.onrender.com/api/admin/event/${eventId}/registrations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRegistrations(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  useEffect(() => {
    const interval = setInterval(() => fetchRegistrations(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [eventId]);

  const filteredRegistrations = useMemo(() => {
    return registrations
      .filter((r) =>
        r.user?.rollNo?.toLowerCase().includes(searchRoll.toLowerCase())
      )
      .filter((r) => {
        if (entryFilter === "entered") return r.status === "checked_in";
        if (entryFilter === "not_entered") return r.status !== "checked_in";
        return true;
      });
  }, [registrations, searchRoll, entryFilter]);

  const total = registrations.length;
  const entered = registrations.filter((r) => r.status === "checked_in").length;
  const notEntered = total - entered;

  const downloadCSV = () => {
    const headers = ["Name", "Roll No", "Email", "Status", "Checked In At"];
    const rows = filteredRegistrations.map((r) => [
      r.user?.name,
      r.user?.rollNo,
      r.user?.email,
      r.status,
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "",
    ]);

    const csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${eventId}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return <p className="text-center text-gray-400 mt-20">Loading...</p>;

  if (error)
    return <p className="text-center text-red-400 mt-20">{error}</p>;

  return (
    <div className="p-6 text-gray-200">
      <h2 className="text-2xl font-bold mb-6">📋 Event Registrations</h2>

      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-green-900/30 p-4 rounded-xl text-center">
          <p className="text-sm text-green-400">Entered</p>
          <p className="text-2xl font-bold text-green-400">{entered}</p>
        </div>
        <div className="bg-red-900/30 p-4 rounded-xl text-center">
          <p className="text-sm text-red-400">Not Entered</p>
          <p className="text-2xl font-bold text-red-400">{notEntered}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by Roll Number"
          value={searchRoll}
          onChange={(e) => setSearchRoll(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-64 focus:outline-none"
        />

        <select
          value={entryFilter}
          onChange={(e) => setEntryFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
        >
          <option value="all">All</option>
          <option value="entered">Entered</option>
          <option value="not_entered">Not Entered</option>
        </select>

        <button
          onClick={downloadCSV}
          className="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          ⬇ Download CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Roll No</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Entry</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredRegistrations.map((r, i) => (
              <tr
                key={r._id}
                className={`border-t border-gray-700 ${
                  r.status === "checked_in"
                    ? "bg-green-900/10"
                    : "bg-gray-900"
                }`}
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{r.user?.name}</td>
                <td className="p-3">{r.user?.rollNo}</td>
                <td className="p-3">{r.user?.email}</td>
                <td
                  className={`p-3 font-bold ${
                    r.status === "checked_in"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {r.status.toUpperCase()}
                </td>
                <td className="p-3">
                  {r.status === "checked_in" ? "ENTERED ✅" : "NOT ENTERED ❌"}
                </td>
                <td className="p-3">
                  {r.checkedInAt
                    ? new Date(r.checkedInAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewRegistrations;
