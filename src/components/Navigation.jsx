import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, Compass, Bell, EnvelopeSimple, UserCircle, PlayCircle } from '@phosphor-icons/react';
import './Navigation.css'; // We'll create this

const Navigation = () => {
  return (
    <nav className="brutalist-nav" data-testid="main-navigation">
      <div className="nav-logo">
        <h2>ENGAGE</h2>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <House size={28} weight="bold" />
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <Compass size={28} weight="bold" />
          <span className="nav-label">Explore</span>
        </NavLink>
        <NavLink to="/reels" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <PlayCircle size={28} weight="bold" />
          <span className="nav-label">Reels</span>
        </NavLink>
        <button className="nav-link" onClick={() => alert("Alerts Drawer Coming Soon!")}>
          <Bell size={28} weight="bold" />
          <span className="nav-label">Alerts</span>
        </button>
        <NavLink to="/messages" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <EnvelopeSimple size={28} weight="bold" />
          <span className="nav-label">Messages</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <UserCircle size={28} weight="bold" />
          <span className="nav-label">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
