import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../utils/axios";

const ManageEvents = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) {
        toast.error("Unauthorized");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get("/events/my-events");
        setEvents(data);
      } catch {
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading events...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <button
            onClick={() => navigate("/events")}
            className="px-4 py-2 rounded-lg text-sm
                       bg-zinc-800 text-zinc-300
                       hover:bg-zinc-700 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-extrabold text-[#7A1CAC]">
            📊 Manage Events
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/scan")}
              className="px-5 py-2 rounded-lg font-semibold text-black
                         bg-blue-500 hover:bg-blue-600 transition"
              style={{
                boxShadow: "0 0 20px rgba(59,130,246,0.8)",
              }}
            >
              📷 Scan QR Tickets
            </button>

            <button
              onClick={() => navigate("/admin/manage-events/create")}
              className="px-6 py-2 rounded-lg font-bold text-black
                         transition hover:scale-[1.05]"
              style={{
                background: "#7A1CAC",
                boxShadow: "0 0 20px rgba(122,28,172,1)",
              }}
            >
              ➕ Create Event
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="text-zinc-400">
            You haven’t created any events yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => {
              const isClosed =
                new Date(event.registrationDeadline) < new Date();

              return (
                <div
                  key={event._id}
                  className="bg-zinc-950 border border-zinc-800
                             rounded-2xl p-6"
                  style={{
                    boxShadow:
                      "0 0 30px rgba(122,28,172,0.25)",
                  }}
                >
                  <h2 className="text-xl font-bold text-zinc-100 mb-2">
                    {event.title}
                  </h2>

                  <p className="text-zinc-400 text-sm mb-1">
                    📍 {event.venue}
                  </p>

                  <p className="text-zinc-400 text-sm mb-1">
                    🕒 {new Date(event.date).toLocaleString()}
                  </p>

                  <p className="text-zinc-400 text-sm mb-3">
                    💰 ₹{event.price}
                  </p>

                  <span
                    className={`inline-block mb-4 px-3 py-1
                      text-xs font-semibold rounded-full ${
                        isClosed
                          ? "bg-red-600/20 text-red-400"
                          : "bg-green-600/20 text-green-400"
                      }`}
                  >
                    {isClosed
                      ? "Registrations Closed"
                      : "Registrations Open"}
                  </span>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate(`/events/edit/${event._id}`)
                      }
                      className="px-4 py-2 text-sm rounded-lg
                                 bg-[#7A1CAC]/20 text-[#7A1CAC]
                                 hover:bg-[#7A1CAC]/30 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/admin/events/${event._id}/stats`)
                      }
                      className="px-4 py-2 text-sm rounded-lg
                                 bg-zinc-800 text-zinc-300
                                 hover:bg-zinc-700 transition"
                    >
                      View Stats
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
