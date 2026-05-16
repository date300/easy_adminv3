import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Users from "./pages/Users";

// ডামি কম্পোনেন্ট (আপনি চাইলে আলাদা ফাইল করতে পারেন)
const Deposit = () => <div className="text-2xl font-bold">Deposit Page</div>;
const Withdraw = () => <div className="text-2xl font-bold">Withdraw Page</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="users" element={<Users />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdraw" element={<Withdraw />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
