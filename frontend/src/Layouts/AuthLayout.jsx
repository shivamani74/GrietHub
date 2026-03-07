import React from "react";
import Footer from "../components/Footer";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default AuthLayout;
