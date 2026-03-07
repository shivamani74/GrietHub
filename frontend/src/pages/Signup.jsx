import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNo: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const sendOtp = async () => {
    const { name, email, rollNo, phone, password, confirmPassword } = form;

    if (!name || !email || !rollNo || !phone || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5002/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your college email");
      setStep(2);
    } catch {
      toast.error("Server error. Please try again");
    } finally {
      setLoading(false);
    }
  };

 
  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5002/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "OTP verification failed");
        return;
      }

      toast.success("Registration successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch {
      toast.error("Verification error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">

        
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-4 animate-left">
          <img
            src={require("../assets/griet-glow.png")}
            alt="GRIEThub"
            className="w-40 mb-4"
          />

          <h1 className="text-2xl font-extrabold mb-3 text-[#7A1CAC]">
            GRIEThub
          </h1>

          <p className="text-zinc-400 text-base leading-relaxed max-w-md">
            Register to explore and enjoy academic, technical, and cultural
            events at Gokaraju Rangaraju Institute of Engineering & Technology.
            Stay updated, participate easily, and never miss an event.
          </p>
        </div>

        
        <div className="flex justify-center animate-right">
          <div
            className="w-full max-w-md rounded-2xl p-8 bg-zinc-950 border border-zinc-800"
            style={{
              boxShadow:
                "0 0 40px rgba(122,28,172,0.35), 0 0 80px rgba(46,7,63,0.45)",
            }}
          >
            <h2
              className="text-3xl font-extrabold text-center mb-2"
              style={{ color: "#7A1CAC" }}
            >
              {step === 1 ? "Create Account" : "Verify OTP"}
            </h2>

            <p className="text-center text-zinc-400 text-sm mb-6">
              {step === 1
                ? "Join the campus community"
                : "Enter the OTP sent to your email"}
            </p>

            
            {step === 1 && (
              <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                <p className="text-yellow-400 text-xs leading-relaxed text-center">
                  ⚠️ Please use your{"kjbhb "}
                  <span className="font-semibold">
                    official college email ID
                  </span>{" "}
                  only. Any misuse, impersonation, or unsafe activity will result
                  in{" "}
                  <span className="font-semibold">
                    strict disciplinary action
                  </span>{" "}
                  as per college policies.
                </p>
              </div>
            )}

            
            {step === 1 && (
              <div className="space-y-4">
                {[
                  { name: "name", placeholder: "Full Name" },
                  { name: "email", placeholder: "College Email" },
                  { name: "rollNo", placeholder: "Roll Number" },
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

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-bold text-black transition hover:scale-[1.03] disabled:opacity-60"
                  style={{
                    background: "#7A1CAC",
                    boxShadow: "0 0 25px rgba(122,28,172,1)",
                  }}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>

               
                <div className="pt-4 text-center">
                  <p className="text-sm text-zinc-400">
                    Are you an admin?{" "}
                    <Link
                      to="/admin/signup"
                      className="text-[#7A1CAC] font-semibold hover:underline"
                    >
                      Register here
                    </Link>
                  </p>
                </div>
              </div>
            )}

            
            {step === 2 && (
              <div className="space-y-4">
                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg bg-black
                             border border-zinc-800 rounded-lg px-4 py-2.5
                             text-zinc-100 outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#7A1CAC" }}
                />

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-bold text-black transition hover:scale-[1.03] disabled:opacity-60"
                  style={{
                    background: "#7A1CAC",
                    boxShadow: "0 0 25px rgba(122,28,172,1)",
                  }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
