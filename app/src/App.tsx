import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { Home } from './features/home/Home'
import { UnitPage } from './features/unit/UnitPage'
import { ChunkShadow } from './features/chunks/ChunkShadow'
import { ListenTypeSession } from './features/listen/ListenTypeSession'
import { Settings } from './features/settings/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unit/:id" element={<UnitPage />} />
        <Route path="/unit/:id/chunks" element={<ChunkShadow />} />
        <Route path="/unit/:id/lesson" element={<ListenTypeSession />} />
        <Route path="/review" element={<ListenTypeSession />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <nav className="nav">
        <NavLink to="/" end><span>🏠</span>Home</NavLink>
        <NavLink to="/review"><span>🔁</span>Review</NavLink>
        <NavLink to="/settings"><span>⚙️</span>Settings</NavLink>
      </nav>
    </BrowserRouter>
  )
}
