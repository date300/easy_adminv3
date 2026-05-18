import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Payments from "./pages/Payments";   // ← নতুন import

// ডামি পেজ (পরে আলাদা ফাইল করবে)
const Deposit = () => <div className="text-2xl font-bold">Deposit Page</div>;
const Withdraw = () => <div className="text-2xl font-bold">Withdraw Page</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route: লগইন পেজ */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes: Layout-এর ভিতরে সব প্রটেক্টেড পেজ */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* index রুট "/" কে "/home"-এ রিডাইরেক্ট করবে */}
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />   {/* ← নতুন route */}
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
          </Route>

          {/* যেকোনো অজানা রুট লগইন পেজে রিডাইরেক্ট করবে */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

