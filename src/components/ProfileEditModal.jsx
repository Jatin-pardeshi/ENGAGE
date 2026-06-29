import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { X } from '@phosphor-icons/react';

const ProfileEditModal = ({ isOpen, onClose, userData, onSave }) => {
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState(userData?.avatarUrl || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName,
        avatarUrl
      });
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: avatarUrl
      });
      onSave({ ...userData, displayName, avatarUrl });
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="brutalist-card" style={{ width: '90%', maxWidth: '400px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} weight="bold" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Display Name</label>
            <input 
              type="text" 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)}
              className="brutalist-input"
              style={{ width: '100%', padding: '0.5rem', border: '2px solid #000' }}
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Avatar Image URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="url" 
                value={avatarUrl} 
                onChange={e => setAvatarUrl(e.target.value)}
                className="brutalist-input"
                style={{ flex: 1, padding: '0.5rem', border: '2px solid #000' }}
                placeholder="https://..."
              />
            </div>
            <small style={{ marginTop: '0.5rem', display: 'block', color: '#666' }}>Paste an image URL to use as your avatar.</small>
          </div>

          <button 
            type="submit" 
            className="brutalist-button pink" 
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
