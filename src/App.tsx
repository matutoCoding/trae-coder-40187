import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Generate from '@/pages/Generate'
import Itinerary from '@/pages/Itinerary'
import Checklist from '@/pages/Checklist'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Generate />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/checklist" element={<Checklist />} />
        </Route>
      </Routes>
    </Router>
  )
}
