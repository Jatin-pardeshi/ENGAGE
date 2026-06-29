import React, { useState, useEffect } from 'react';
import { Gear, Link, MapPin } from '@phosphor-icons/react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import GamificationWidget from '../components/GamificationWidget';
import ProfileEditModal from '../components/ProfileEditModal';
import Post from '../components/Post';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.currentUser) return;
      try {
        // Fetch User Data
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        // Fetch User's Posts
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, where('authorUid', '==', auth.currentUser.uid));
        const postsSnap = await getDocs(q);
        const posts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort posts by date descending locally since we might not have a composite index
        posts.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        setUserPosts(posts);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [auth.currentUser]);

  if (loading) return <div>Loading profile...</div>;
  if (!userData) return <div>Please log in to view your profile.</div>;

  return (
    <div className="profile-page">
      <div className="profile-header brutalist-card">
        <div className="profile-top">
          <div className="profile-avatar-large" style={userData.avatarUrl ? { backgroundImage: `url(${userData.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {!userData.avatarUrl && userData.displayName?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-stats-counts">
            <div className="stat-count">
              <strong>{userPosts.length}</strong> Posts
            </div>
            <div className="stat-count">
              <strong>{userData.followers?.length || 0}</strong> Followers
            </div>
            <div className="stat-count">
              <strong>{userData.following?.length || 0}</strong> Following
            </div>
          </div>
        </div>
        
        <div className="profile-info">
          <h2 className="profile-name">{userData.displayName}</h2>
          <span className="profile-handle">@{userData.displayName?.toLowerCase().replace(/\s/g, '')}</span>
          <p className="profile-bio">Exploring the world through a brutalist lens. 🌸 | Digital Creator</p>
        </div>

        <div className="profile-actions">
          <button className="brutalist-button pink" onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
          <button className="brutalist-button yellow"><Gear size={24} /></button>
        </div>
      </div>

      <GamificationWidget streak={userData.streak || 0} level={userData.level || 1} xp={userData.xp || 0} xpMax={2000} />

      <div className="highlights-section" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Story Highlights</h3>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {/* Placeholder for highlights */}
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0' }}>+</div>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ff6b6b' }}>Vacay</div>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#4ecdc4' }}>Food</div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Your Posts</h3>
        <div className="profile-grid">
          {userPosts.length === 0 ? (
            <p>You haven't posted anything yet.</p>
          ) : (
            userPosts.map(post => (
              <div key={post.id} className="grid-item" style={{ overflow: 'hidden', position: 'relative' }}>
                {post.type === 'video' ? (
                  <video src={post.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                ) : (
                  <img src={post.imageUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        userData={userData}
        onSave={(updatedData) => setUserData(updatedData)}
      />
    </div>
  );
};

export default Profile;
