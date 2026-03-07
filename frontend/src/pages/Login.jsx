import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/axios";

const Login = () => {
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));


  if (token && user?.role) {
    if (user.role === "superadmin") {
      navigate("/superadmin/dashboard");
    } else if (user.role === "admin") {
      navigate("/manage-events");
    } else {
      navigate("/events");
    }
  }
}, [navigate]);


  
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!rollNo || !password) {
      toast.error("Please enter roll number and password");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/auth/login", {
        rollNo,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        if (data.user.role === "superadmin") {
          navigate("/superadmin/dashboard");
        } else if (data.user.role === "admin") {
          navigate("/manage-events");
        } else {
          navigate("/events");
        }
      }, 1200);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-44 items-center">

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left px-4 animate-left">
          <img
            src={require("../assets/griet-glow.png")}
            alt="GRIEThub"
            className="w-28 mb-6"
          />

          <h1 className="text-3xl font-extrabold mb-4 text-[#7A1CAC]">
            GRIEThub
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            GRIEThub is the official digital platform for managing and
            discovering academic, technical, and cultural events at
            Gokaraju Rangaraju Institute of Engineering & Technology.
            Secure, fast, and built for students.
          </p>
        </div>

        <div className="flex justify-center animate-right">
          <div
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-8"
            style={{
              boxShadow:
                "0 0 35px rgba(122,28,172,0.35), 0 0 70px rgba(46,7,63,0.45)",
            }}
          >
            <h2
              className="text-3xl font-extrabold text-center mb-2"
              style={{ color: "#7A1CAC" }}
            >
              Student Login
            </h2>

            <p className="text-center text-zinc-400 text-sm mb-6">
              Login to continue to events
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                placeholder="Roll Number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5
                           text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7A1CAC" }}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-2.5
                           text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#7A1CAC" }}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg font-bold text-black
                           transition hover:scale-[1.03] disabled:opacity-60"
                style={{
                  background: "#7A1CAC",
                  boxShadow: "0 0 22px rgba(122,28,172,1)",
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-400 mt-6">
              New student?{" "}
              <Link
                to="/signup"
                className="text-[#7A1CAC] font-semibold hover:underline"
              >
                Signup
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
