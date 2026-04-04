// FILE: src/App.jsx  (updated — adds /admin route + AdPopup)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdPopup from './components/AdPopup';          // ← NEW
import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import PostProperty from './pages/PostProperty';
import ScoutUpload from './pages/ScoutUpload';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';          // ← NEW

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen" style={{ background: 'var(--c-cream)' }}>
          <Navbar />
          <AdPopup />                                {/* ← NEW: shows ad popup on load */}
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/listings"       element={<Listings />} />
            <Route path="/property/:id"   element={<PropertyDetail />} />
            <Route path="/post-property"  element={<PostProperty />} />
            <Route path="/scout-upload"   element={<ScoutUpload />} />
            <Route path="/profile"        element={<Profile />} />
            <Route path="/login"          element={<Login />} />
            <Route path="/admin"          element={<SuperAdmin />} />  {/* ← NEW */}
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}