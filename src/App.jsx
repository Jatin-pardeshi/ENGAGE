import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { House, Compass, Bell, EnvelopeSimple, User, PlayCircle } from '@phosphor-icons/react';
import { auth } from './firebase';
import Navigation from './components/Navigation';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import Messages from './pages/Messages';
import './index.css'; // Global brutalist styles

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}><h2>Loading...</h2></div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        
        <Route path="/*" element={
          user ? (
            <div className="app-container">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Feed user={user} />} />
                  <Route path="/reels" element={<Reels user={user} />} />
                  <Route path="/messages" element={<Messages user={user} />} />
                  <Route path="/profile" element={<Profile user={user} />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
