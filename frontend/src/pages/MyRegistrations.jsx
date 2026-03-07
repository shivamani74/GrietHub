import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import fallbackImg from "../assets/event-placeholder.jpg";

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    const fetchMyRegistrations = async () => {
      try {
        const res = await fetch(
          "https://griethub.onrender.com/api/registrations/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load registrations");
          return;
        }

        setRegistrations(data);
      } catch {
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchMyRegistrations();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading your registrations...</p>
      </div>
    );
  }

  return (
<div className="bg-black px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#7A1CAC] mb-8">
          🎟 My Registrations
        </h1>

        {registrations.length === 0 ? (
          <p className="text-zinc-400">
            You have not registered for any events yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {registrations.map((reg) => (
              <div
                key={reg._id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6"
                style={{
                  boxShadow: "0 0 30px rgba(122,28,172,0.25)",
                }}
              >
                <div className="h-[200px] mb-4 overflow-hidden rounded-xl bg-black">
                  <img
                    src={reg.event?.images?.[0] || fallbackImg}
                    alt={reg.event?.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <h2 className="text-xl font-bold text-zinc-100 mb-2">
                  {reg.event?.title}
                </h2>

                <p className="text-zinc-400 text-sm mb-1">
                  📍 {reg.event?.venue}
                </p>

                <p className="text-zinc-400 text-sm mb-4">
                  🕒 {new Date(reg.event?.date).toLocaleString()}
                </p>

                <span
                  className={`inline-block mb-3 px-3 py-1 text-xs font-semibold rounded-full
                    ${
                      reg.status === "checked_in"
                        ? "bg-green-600/20 text-green-400"
                        : "bg-purple-600/20 text-purple-400"
                    }`}
                >
                  {reg.status === "checked_in"
                    ? "Checked In"
                    : "Paid – QR Sent to Email"}
                </span>

                <p className="text-zinc-500 text-xs leading-relaxed">
                  {reg.status === "checked_in"
                    ? "You have successfully attended this event."
                    : "Your entry QR code has been sent to your registered email. Please show it at the venue entrance."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;
