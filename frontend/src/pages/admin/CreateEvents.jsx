import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateEvents = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    registrationDeadline: "",
    price: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Session expired. Login again.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("https://griet-hub-backend.onrender.com/api/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create event");
        return;
      }

      toast.success("🎉 Event created successfully!");
      navigate("/manage-events");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-extrabold text-[#7A1CAC] mb-8">
          ➕ Create New Event
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 space-y-5"
          style={{ boxShadow: "0 0 30px rgba(122,28,172,0.35)" }}
        >
          <input
            name="title"
            placeholder="Event Title"
            value={form.title}
            onChange={handleChange}
            className="input"
          />

          <textarea
            name="description"
            placeholder="Event Description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="input"
          />

          <input
            name="venue"
            placeholder="Venue"
            value={form.venue}
            onChange={handleChange}
            className="input"
          />

          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input"
          />

          <input
            type="datetime-local"
            name="registrationDeadline"
            value={form.registrationDeadline}
            onChange={handleChange}
            className="input"
          />

          <input
            type="number"
            name="price"
            placeholder="Price (₹)"
            value={form.price}
            onChange={handleChange}
            className="input"
          />

          <label className="text-zinc-400 text-sm">
  Upload Event Images (JPG / PNG)
</label>
<input
  type="file"
  multiple
  accept="image/jpeg,image/png"
  onChange={handleImageChange}
/>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-black transition hover:scale-[1.03]"
            style={{
              background: "#7A1CAC",
              boxShadow: "0 0 25px rgba(122,28,172,1)",
            }}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvents;
