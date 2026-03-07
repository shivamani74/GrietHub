import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import fallbackImg from "../assets/event-placeholder.jpg";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("https://griethub.onrender.com/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  const filteredEvents = useMemo(() => {
    if (!search) return events;

    const q = search.toLowerCase();
    return events.filter(
      (event) =>
        event.title?.toLowerCase().includes(q) ||
        event.venue?.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q)
    );
  }, [search, events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <h2 className="text-4xl font-extrabold text-[#7A1CAC] text-center mb-8">
        Upcoming Events
      </h2>

      <div className="max-w-xl mx-auto mb-14">
        <input
          type="text"
          placeholder="Search events by name, venue, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full"
        />
      </div>

      <div className="max-w-6xl mx-auto space-y-14">
        {filteredEvents.length === 0 ? (
          <p className="text-center text-zinc-400">
            No events found.
          </p>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10"
              style={{
                boxShadow:
                  "0 0 45px rgba(122,28,172,0.3), 0 0 90px rgba(46,7,63,0.45)",
              }}
            >
              <div className="flex justify-center mb-10">
                <div className="relative w-[520px] h-[300px] overflow-hidden rounded-3xl">
                  <div className="event-carousel">
                    {(event.images && event.images.length > 0
                      ? event.images
                      : [fallbackImg]
                    ).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={event.title}
                        className="w-full h-full object-contain bg-black"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {event.title}
                  </h3>

                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    {event.description.slice(0, 160)}...
                  </p>

                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>
                      <span className="text-zinc-300 font-semibold">
                        📅 Date:
                      </span>{" "}
                      {new Date(event.date).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-zinc-300 font-semibold">
                        📍 Venue:
                      </span>{" "}
                      {event.venue}
                    </p>
                    <p>
                      <span className="text-zinc-300 font-semibold">
                        💰 Price:
                      </span>{" "}
                      ₹{event.price}
                    </p>
                  </div>
                </div>

                <div className="flex md:justify-end">
                  <button
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="px-8 py-3 rounded-xl font-bold text-black
                               transition hover:scale-[1.06]"
                    style={{
                      background: "#7A1CAC",
                      boxShadow: "0 0 25px rgba(122,28,172,1)",
                    }}
                  >
                    View & Register
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
