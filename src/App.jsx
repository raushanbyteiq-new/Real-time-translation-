import { Routes, Route } from 'react-router-dom'
import HomePage from './HomePage.jsx'
import WebRTC from './WebRTC.jsx'
import WebRTCWithTranslation1 from './WebRTCWithBuffer.jsx'
import AIDashboard from './AiDashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/meeting" element={<WebRTC />} /> */}
      <Route path='/meeting' element={<WebRTCWithTranslation1 />} />
    </Routes>
  )
}

export default App
