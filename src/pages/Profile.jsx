import React from 'react';
import { Gear, Link, MapPin } from '@phosphor-icons/react';
import GamificationWidget from '../components/GamificationWidget';
import './Profile.css';

const MOCK_PROFILE = {
  name: 'Jane Doe',
  handle: '@janedoe',
  bio: 'Exploring the world through a pastel lens. 🌸 | Digital Creator',
  location: 'Los Angeles, CA',
  link: 'janedoe.com',
  followers: 12400,
  following: 850,
  posts: 142
};

const Profile = () => {
  return (
    <div className="profile-page">
      <div className="profile-header brutalist-card">
        <div className="profile-top">
          <div className="profile-avatar-large"></div>
          <div className="profile-stats-counts">
            <div className="stat-count">
              <strong>{MOCK_PROFILE.posts}</strong> Posts
            </div>
            <div className="stat-count">
              <strong>{MOCK_PROFILE.followers}</strong> Followers
            </div>
            <div className="stat-count">
              <strong>{MOCK_PROFILE.following}</strong> Following
            </div>
          </div>
        </div>
        
        <div className="profile-info">
          <h2 className="profile-name">{MOCK_PROFILE.name}</h2>
          <span className="profile-handle">{MOCK_PROFILE.handle}</span>
          <p className="profile-bio">{MOCK_PROFILE.bio}</p>
          
          <div className="profile-meta">
            <span><MapPin size={16} /> {MOCK_PROFILE.location}</span>
            <span><Link size={16} /> <a href="#">{MOCK_PROFILE.link}</a></span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="brutalist-button pink">Edit Profile</button>
          <button className="brutalist-button yellow"><Gear size={24} /></button>
        </div>
      </div>

      <GamificationWidget streak={42} level={12} xp={1200} xpMax={2000} />

      <div className="profile-grid">
        {/* Placeholder grid for posts */}
        {[...Array(9)].map((_, i) => (
          <div key={i} className="grid-item"></div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
