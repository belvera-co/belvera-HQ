import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import RDLab from './pages/RDLab'
import Suppliers from './pages/Suppliers'
import Inventory from './pages/Inventory'
import SOPs from './pages/SOPs'
import Franchise from './pages/Franchise'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rd" element={<RDLab />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sops" element={<SOPs />} />
          <Route path="/franchise" element={<Franchise />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
