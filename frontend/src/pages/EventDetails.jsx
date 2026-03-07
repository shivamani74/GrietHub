import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import fallbackImg from "../assets/event-placeholder.jpg";

const EventDetails = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  let user = null;
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw && userRaw !== "undefined") {
      user = JSON.parse(userRaw);
    }
  } catch {
    localStorage.removeItem("user");
  }

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`https://griet-hub-backend.onrender.com/api/events/${id}`);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load event");
          return;
        }

        setEvent(data);
      } catch {
        toast.error("Server error while loading event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!event?.images || event.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === event.images.length - 1 ? 0 : prev + 1
      );
    }, 3000); 

    return () => clearInterval(interval);
  }, [event]);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRegisterAndPay = async () => {
    if (!user || !token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setPaying(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load Razorpay");
      setPaying(false);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5002/api/payments/create-order/${event._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = await res.json();

      if (!res.ok) {
        toast.error(order.message || "Payment init failed");
        return;
      }

      const options = {
        key: order.razorpayKey,
        amount: order.amount * 100,
        currency: "INR",
        name: "GRIEThub",
        description: event.title,
        order_id: order.orderId,

        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              "http://localhost:5002/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  paymentId: order.paymentId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              toast.error(verifyData.message || "Verification failed");
              return;
            }

            toast.success("🎉 Registration successful!");
          } catch {
            toast.error("Payment verification error");
          }
        },

        prefill: {
          name: user.name,
          email: user.email,
        },

        theme: { color: "#7A1CAC" },
      };

      new window.Razorpay(options).open();
    } catch {
      toast.error("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">Event not found</p>
      </div>
    );
  }

  const images =
    event.images && event.images.length > 0
      ? event.images
      : [fallbackImg];

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-center mb-12">
          <div className="relative w-[620px] h-[360px] rounded-3xl overflow-hidden bg-black">
            <div
              className="flex h-full transition-transform duration-1000 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`event-${idx}`}
                  className="w-[620px] h-[360px] object-contain flex-shrink-0 bg-black"
                />
              ))}
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-[#7A1CAC] mb-6">
          {event.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-zinc-300 mb-12">
          <p>📍 <b>Venue:</b> {event.venue}</p>
          <p>🕒 <b>Date:</b> {new Date(event.date).toLocaleString()}</p>
          <p>💰 <b>Price:</b> ₹{event.price}</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-zinc-100 mb-4">
            📖 Event Description
          </h2>
          <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleRegisterAndPay}
            disabled={paying}
            className="px-12 py-4 rounded-xl font-bold text-black text-lg
                       transition hover:scale-[1.05] disabled:opacity-60"
            style={{
              background: "#7A1CAC",
              boxShadow: "0 0 28px rgba(122,28,172,1)",
            }}
          >
            {paying ? "Processing..." : "Register & Pay"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;
