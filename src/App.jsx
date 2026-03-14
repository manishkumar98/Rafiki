import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import RoleSelect from './pages/RoleSelect'
import MemberView from './pages/MemberView'
import EAEDashboard from './pages/EAEDashboard'
import OpsDashboard from './pages/OpsDashboard'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/member/:id" element={<MemberView />} />
        <Route path="/eae" element={<EAEDashboard />} />
        <Route path="/ops" element={<OpsDashboard />} />
      </Routes>
    </HashRouter>
  )
}
