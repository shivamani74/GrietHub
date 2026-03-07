import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import { toast } from "react-toastify";

const EditEvent = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    registrationDeadline: "",
    price: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/events/${id}`);

        setFormData({
          title: data.title || "",
          description: data.description || "",
          venue: data.venue || "",
          date: data.date ? data.date.split("T")[0] : "",
          registrationDeadline: data.registrationDeadline
            ? data.registrationDeadline.split("T")[0]
            : "",
          price: data.price ?? "",
        });

        setLoading(false);
      } catch {
        toast.error("Failed to load event");
      }
    };

    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`/events/${id}`, formData);

      toast.success("Event updated successfully", {
        onClose: () => {
          window.location.replace("/events");
        },
      });
    } catch {
      toast.error("Failed to update event");
      setSaving(false);
    }
  };

  
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    )
      return;

    setDeleting(true);

    try {
      await axios.delete(`/events/${id}`);

      toast.success("Event deleted successfully", {
        onClose: () => {
          window.location.replace("/events");
        },
      });
    } catch {
      toast.error("Failed to delete event");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-black shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold text-[#7A1CAC] mb-6">
        Edit Event
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Event Title"
          className="input"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Event Description"
          rows="4"
          className="input"
          required
        />

        <input
          type="text"
          name="venue"
          value={formData.venue}
          onChange={handleChange}
          placeholder="Venue"
          className="input"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input"
            required
          />

          <input
            type="date"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price (₹)"
          className="input"
        />

        <div className="flex justify-between items-center pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[#7A1CAC] text-white
                       hover:bg-[#6a1695] transition disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Event"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 rounded-lg bg-red-500 text-white
                       hover:bg-red-600 transition disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
