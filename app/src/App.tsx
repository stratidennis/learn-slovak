import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { Home } from './features/home/Home'
import { UnitPage } from './features/unit/UnitPage'
import { ChunkShadow } from './features/chunks/ChunkShadow'
import { ListenTypeSession } from './features/listen/ListenTypeSession'
import { Settings } from './features/settings/Settings'
import { Alphabet } from './features/alphabet/Alphabet'
import { LessonSession } from './features/lesson/LessonSession'
import { useT } from './i18n'

export default function App() {
  const t = useT()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unit/:id" element={<UnitPage />} />
        <Route path="/unit/:id/chunks" element={<ChunkShadow />} />
        <Route path="/unit/:id/lesson" element={<LessonSession />} />
        <Route path="/unit/:id/dictation" element={<ListenTypeSession />} />
        <Route path="/review" element={<ListenTypeSession />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/alphabet" element={<Alphabet />} />
      </Routes>
      <nav className="nav">
        <NavLink to="/" end><span>🏠</span>{t.nav_home}</NavLink>
        <NavLink to="/review"><span>🔁</span>{t.nav_review}</NavLink>
        <NavLink to="/settings"><span>⚙️</span>{t.nav_settings}</NavLink>
      </nav>
    </BrowserRouter>
  )
}
