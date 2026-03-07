import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    name,
    email,
    rollNo,
    phone,
    password,
  } = location.state || {};

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://griet-hub-backend.onrender.com/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            rollNo,
            phone,
            password,
            otp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "OTP verification failed");
        setLoading(false);
        return;
      }

      alert("✅ Registration successful. Please login.");
      navigate("/login");

    } catch (err) {
      console.error("OTP VERIFY ERROR:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🔐 OTP Verification</h2>

      <p>
        Enter the 6-digit OTP sent to <b>{email}</b>
      </p>

      <form onSubmit={handleVerifyOtp} style={styles.form}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
          maxLength={6}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: {
    marginTop: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "18px",
    textAlign: "center",
    letterSpacing: "4px",
    marginBottom: "15px",
  },
  button: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default VerifyOtp;
