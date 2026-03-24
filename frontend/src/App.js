import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar';
import OrderForm from './Pages/OrderForm';
import OrderDashboard from './Pages/OrderDashboard';
import OrderDetails from './Pages/OrderDetails';
import PaymentUI from './Pages/PaymentUI';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/order-form" />} />
            <Route path="/order-form" element={<OrderForm />} />
            <Route path="/order-dashboard" element={<OrderDashboard />} />
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/payment" element={<PaymentUI />} />
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/order-form" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
