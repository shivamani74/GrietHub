import React, { useEffect, useState } from "react";
import axios from "axios";

const EventStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `http:localhost:5002/api/events/stats`
        );
        setStats(res.data);
      } catch (err) {
        setError("Failed to load event statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading event stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Event Statistics
      </h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Events" value={stats.totalEvents} />
        <StatCard title="Total Registrations" value={stats.totalRegistrations} />
        <StatCard title="Total Revenue (₹)" value={stats.totalRevenue} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Event-wise Breakdown
        </h2>

        <div className="space-y-4">
          {stats.events.map((event) => (
            <div
              key={event._id}
              className="border rounded-md p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Registrations: {event.registrations}
                </p>
              </div>

              <div className="mt-2 sm:mt-0 text-blue-600 font-semibold">
                ₹ {event.revenue}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white shadow rounded-lg p-6 text-center">
    <p className="text-gray-500">{title}</p>
    <h2 className="text-2xl font-bold text-gray-800 mt-2">{value}</h2>
  </div>
);

export default EventStats;
