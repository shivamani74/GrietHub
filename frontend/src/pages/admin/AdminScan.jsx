import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

const AdminScan = () => {
  const qrRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [screen, setScreen] = useState(null);

  
  useEffect(() => {
    axios
      .get("/events/my-events")
      .then((res) => setEvents(res.data))
      .catch(() => toast.error("Failed to load events"));
  }, []);

 
  const startScan = async () => {
    if (!selectedEvent) {
      toast.error("Select an event first");
      return;
    }

    if (scanning) return;

    const qr = new Html5Qrcode("qr-reader");
    qrRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 260 },
        async (decodedText) => {
          if (processing) return;

          setProcessing(true);
          setResult(null);

          try {
            const { data } = await axios.post("/entry/scan", {
              qrToken: decodedText.trim(),
              eventId: selectedEvent,
            });

            setScreen("success");
            setResult(data);
            toast.success("Entry allowed");
          } catch (err) {
            setScreen("error");
            toast.error(
              err.response?.data?.message || "Invalid / Used QR"
            );
          }

          setTimeout(() => {
            setScreen(null);
            setProcessing(false);
          }, 2000);
        }
      );

      setScanning(true);
    } catch {
      toast.error("Camera permission denied");
    }
  };

  
   
  const stopScan = async () => {
    if (qrRef.current) {
      await qrRef.current.stop();
      await qrRef.current.clear();
      qrRef.current = null;
    }
    setScanning(false);
  };

  return (
    <div className="min-h-screen bg-black p-6 relative overflow-hidden">

      {screen && (
        <>
          <div
            className={`fixed left-0 top-0 h-full w-3 z-50 pointer-events-none ${
              screen === "success"
                ? "bg-green-500 shadow-[0_0_30px_10px_rgba(34,197,94,0.9)]"
                : "bg-red-500 shadow-[0_0_30px_10px_rgba(239,68,68,0.9)]"
            }`}
          />
          <div
            className={`fixed right-0 top-0 h-full w-3 z-50 pointer-events-none ${
              screen === "success"
                ? "bg-green-500 shadow-[0_0_30px_10px_rgba(34,197,94,0.9)]"
                : "bg-red-500 shadow-[0_0_30px_10px_rgba(239,68,68,0.9)]"
            }`}
          />
        </>
      )}

      <h1 className="text-xl text-white mb-4">Admin QR Scanner</h1>

      <select
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
        className="mb-4 p-2 bg-zinc-900 text-white rounded"
      >
        <option value="">Select Event</option>
        {events.map((e) => (
          <option key={e._id} value={e._id}>
            {e.title}
          </option>
        ))}
      </select>

      <div className="flex gap-4 mb-6">
        <button
          onClick={startScan}
          disabled={scanning}
          className="px-4 py-2 bg-green-600 rounded text-white"
        >
          Start Scan
        </button>

        <button
          onClick={stopScan}
          disabled={!scanning}
          className="px-4 py-2 bg-red-600 rounded text-white"
        >
          Stop Scan
        </button>
      </div>

      <div id="qr-reader" className="max-w-sm" />

      {result && (
        <div className="mt-6 bg-green-900/30 p-4 rounded text-white">
          <p><b>Name:</b> {result.student.name}</p>
          <p><b>Event:</b> {result.event}</p>
        </div>
      )}
    </div>
  );
};

export default AdminScan;
