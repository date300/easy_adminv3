import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);
  const [adminName, setAdminName] = useState(localStorage.getItem("adminName") || 
"");

  // টোকেন পরিবর্তন হলে localStorage সিঙ্ক করো
  useEffect(() => {
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  // নাম পরিবর্তন হলে localStorage সিঙ্ক করো
  useEffect(() => {
    if (adminName) {
      localStorage.setItem("adminName", adminName);
    } else {
      localStorage.removeItem("adminName");
    }
  }, [adminName]);

  // লগইন করলে টোকেন ও নাম সেট করো
  const login = (newToken, name) => {
    setToken(newToken);
    setAdminName(name);
  };

  // লগআউট করলে সব মুছে ফেলো
  const logout = () => {
    setToken(null);
    setAdminName("");
  };

  // টোকেন থাকলেই অথেনটিকেটেড
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, adminName, login, logout, 
isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// কাস্টম হুক — যেকোনো কম্পোনেন্ট থেকে সহজে অ্যাক্সেস
export function useAuth() {
  return useContext(AuthContext);
}
