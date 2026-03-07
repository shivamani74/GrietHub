import React from "react";
import { Link } from "react-router-dom";
import grietLogo from "../assets/griet-glow.png";
import CountUp from "../components/Countup";

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <img src={grietLogo} alt="GRIEThub" className="w-10" />
          <span className="text-xl font-bold tracking-wide text-[#7A1CAC]">
            GRIEThub
          </span>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm rounded-md border border-zinc-700 hover:border-[#7A1CAC] transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-4 py-2 text-sm rounded-md font-semibold text-black"
            style={{
              background: "#7A1CAC",
              boxShadow: "0 0 12px #7A1CACE6",
            }}
          >
            Signup
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
          Welcome to{" "}
          <span className="text-[#7A1CAC]">GRIEThub</span>
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto">
          GRIEThub is the official digital platform designed to manage and
          showcase academic, cultural, and technical events at
          <span className="text-white font-medium">
            {" "}Gokaraju Rangaraju Institute of Engineering & Technology
          </span>.
          Built for students, by students — fast, secure, and modern.
        </p>
      </section>
<section className="max-w-6xl mx-auto px-6 py-16">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3
        className="text-3xl font-extrabold mb-1"
        style={{ color: "#7A1CAC" }}
      >
        <CountUp end={50} suffix="+" />
      </h3>
      <p className="text-zinc-400 text-sm">Events Hosted</p>
    </div>

    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3
        className="text-3xl font-extrabold mb-1"
        style={{ color: "#7A1CAC" }}
      >
        <CountUp end={10000} suffix="+" />
      </h3>
      <p className="text-zinc-400 text-sm">Student Registrations</p>
    </div>

    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3
        className="text-3xl font-extrabold mb-1"
        style={{ color: "#7A1CAC" }}
      >
        <CountUp end={20} suffix="+" />
      </h3>
      <p className="text-zinc-400 text-sm">Clubs & Communities</p>
    </div>

    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
      <h3
        className="text-3xl font-extrabold mb-1"
        style={{ color: "#7A1CAC" }}
      >
        <CountUp end={100} suffix="%" />
      </h3>
      <p className="text-zinc-400 text-sm">Digital Experience</p>
    </div>

  </div>
</section>


      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#7A1CAC]">
            About GRIET
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Gokaraju Rangaraju Institute of Engineering & Technology (GRIET)
            is a premier autonomous institution committed to academic
            excellence, innovation, and holistic student development.
            The institute fosters a vibrant campus culture through
            technical fests, cultural events, and professional activities.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-[#7A1CAC]">
            About GRIEThub
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            GRIEThub centralizes event discovery, registrations, and
            participation tracking into one seamless platform.
            Students can explore events, register instantly, and stay
            updated — all with a secure login system and a modern user
            experience.
          </p>
        </div>
      </section>

      <footer className="border-t border-zinc-800 text-center py-6 text-sm text-zinc-500">
        © {new Date().getFullYear()} GRIEThub · GRIET
      </footer>
    </div>
  );
};

export default Home;
