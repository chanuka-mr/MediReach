import logo from './logo.svg';
import './App.css';
import InventoryDashboard from './Component/InventoryDashboard';
import MedicineForm from './Component/MedicineAdd';
import AdminNav from './Component/AdminNavBar';
import MedicineInventory from './Component/MedicineInventory';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminNav />}>
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/medicineAdd" element={<MedicineForm />} />
          <Route path="/medicineInventory" element={<MedicineInventory />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
