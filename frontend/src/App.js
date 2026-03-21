import logo from './logo.svg';
import './App.css';
import InventoryDashboard from './Component/InventoryDashboard';
import MedicineForm from './Component/MedicineAdd';
import Layout from './Component/Layout';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/medicineAdd" element={<MedicineForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
