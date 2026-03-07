import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://griet-hub-backend.onrender.com/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);
  }, [token]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Admin Dashboard</h2>

      {events.map((e) => (
        <div
          key={e.eventId}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "6px",
          }}
        >
          <h3>{e.title}</h3>
          <p>
            📍 {e.venue} | 📅 {new Date(e.date).toLocaleDateString()}
          </p>

          <p>👥 Registrations: {e.registrations}</p>
          <p>💳 Paid Users: {e.paidUsers}</p>
          <p>✅ Checked In: {e.checkedIn}</p>
          <p>💰 Revenue: ₹{e.revenue}</p>

          <a href={`/admin/event/${e.eventId}/registrations`}>
            View Registrations →
          </a>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
