import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import grietLogo from "../assets/griet-glow.png";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNo: "",
    phone: "",
    password: "",
    confirmPassword: "",
    clubName: "",
  });

  const [document, setDocument] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.rollNo ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!document) {
      toast.error("Verification document is required");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) =>
      formData.append(key, form[key])
    );
    formData.append("proofDocument", document);

    setLoading(true);
    try {
      const res = await fetch(
        "https://griethub.onrender.com/api/auth/admin/signup",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      toast.success(
        "Admin signup submitted. Await verification."
      );
      navigate("/login");
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">

]          <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-4 animate-left">
          <img src={grietLogo} alt="GRIEThub" className="w-24 mb-4" />
          <h1 className="text-2xl font-extrabold mb-3 text-[#7A1CAC]">
            GRIEThub – Admin
          </h1>
          <p className="text-zinc-400 max-w-md">
            Register as an administrator to manage and publish
            official college events.
            <br />
            <span className="text-yellow-400 font-semibold">
              ⚠️ Only For The Authorized Clubs and Club's Admins
            </span>
          </p>
        </div>

        <div className="flex justify-center animate-right">
          <div
            className="w-full max-w-md rounded-2xl p-8 bg-zinc-950 border border-zinc-800"
            style={{
              boxShadow:
                "0 0 40px rgba(122,28,172,0.35)",
            }}
          >
            <h2 className="text-3xl font-extrabold text-center text-[#7A1CAC] mb-6">
              Admin Registration
            </h2>
            <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
              <p className="text-yellow-400 text-xs leading-relaxed text-center">
                Admin accounts require manual approval.
                Fake or unauthorized submissions will be rejected
                and may lead to disciplinary action.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { name: "name", placeholder: "Full Name" },
                { name: "email", placeholder: "Official Email" },
                { name: "rollNo", placeholder: "Employee ID" },
                { name: "clubName", placeholder: "Club / Organization Name" },
                { name: "phone", placeholder: "Phone Number" },
              ].map((f) => (
                <input
                  key={f.name}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5
                             text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#7A1CAC" }}
                />
              ))}

           <input
  type="password"
  name="password"
  placeholder="Password"
  value={form.password}
  onChange={handleChange}
  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5
             text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2"
  style={{ "--tw-ring-color": "#7A1CAC" }}
/>


           <input
  type="password"
  name="confirmPassword"
  placeholder="Confirm Password"
  value={form.confirmPassword}
  onChange={handleChange}
  className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5
             text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2"
  style={{ "--tw-ring-color": "#7A1CAC" }}
/>


              <div className="border border-dashed border-zinc-700 rounded-lg p-3">
                <label className="text-xs text-zinc-400">
                  Upload Verification Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setDocument(e.target.files[0])
                  }
                  className="text-zinc-300 text-sm"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-black"
                style={{
                  background: "#7A1CAC",
                  boxShadow:
                    "0 0 25px rgba(122,28,172,1)",
                }}
              >
                {loading
                  ? "Submitting..."
                  : "Request Admin Access"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
