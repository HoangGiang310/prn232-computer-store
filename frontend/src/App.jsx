import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import LoginPage from "./pages/auth/LoginPage";
import ProductsPage from "./pages/products/ProductsPage";
import POSPage from "./pages/pos/POSPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CustomersPage from "./pages/customers/CustomersPage";
import OrdersPage from "./pages/orders/OrdersPage";
import RealtimeAlert from "@/components/shared/RealtimeAlert";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Header token={token} onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            <Route
              path="/dashboard"
              element={
                token ? (
                  <DashboardPage token={token} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/products"
              element={
                token ? (
                  <ProductsPage token={token} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/customers"
              element={
                token ? (
                  <CustomersPage token={token} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/orders"
              element={
                token ? (
                  <OrdersPage token={token} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/pos"
              element={token ? <POSPage /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/"
              element={
                <Navigate to={token ? "/dashboard" : "/login"} replace />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <RealtimeAlert />
      </div>
    </BrowserRouter>
  );
}

export default App;
