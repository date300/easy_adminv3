import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import Business from "./pages/Business";
import Withdraw from "./pages/Withdraw";   // ← নতুন import
import Product from "./pages/Product";

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
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payments />} />
            <Route path="business" element={<Business />} />
            <Route path="product" element={<Product />} />
            <Route path="withdraw" element={<Withdraw />} />   {/* ← আলাদা component */}
          </Route>

          {/* যেকোনো অজানা রুট লগইন পেজে রিডাইরেক্ট করবে */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

