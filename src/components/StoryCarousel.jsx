import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebase';
import { compressAndUploadImage } from '../utils/upload';
import { Plus } from '@phosphor-icons/react';
import './StoryCarousel.css';

const StoryCarousel = ({ user }) => {
  const [stories, setStories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Only show stories from the last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const q = query(
      collection(db, 'stories'),
      where('createdAt', '>=', yesterday),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStories(storiesData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const downloadURL = await compressAndUploadImage(file, 'stories');
      
      await addDoc(collection(db, 'stories'), {
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        imageUrl: downloadURL,
        color: `var(--pastel-${['pink', 'blue', 'green', 'yellow', 'purple'][Math.floor(Math.random() * 5)]})`,
        createdAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error("Error uploading story:", error);
      alert("Failed to upload story.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="story-carousel" data-testid="story-carousel">
      {user && (
        <div className="story-item add-story" onClick={() => fileInputRef.current?.click()}>
          <div className="story-box new-story" style={{ backgroundColor: 'var(--pastel-yellow)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             {isUploading ? <span style={{fontSize: '0.8rem'}}>...</span> : <Plus size={32} weight="bold" />}
          </div>
          <span className="story-username">You</span>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </div>
      )}
      
      {stories.map(story => (
        <div key={story.id} className="story-item">
          <div 
            className="story-box new-story"
            style={{ backgroundColor: story.color }}
          >
            <img src={story.imageUrl} alt={`${story.userName} story`} />
          </div>
          <span className="story-username">{story.userName}</span>
        </div>
      ))}
    </div>
  );
};

export default StoryCarousel;
