import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import StoryCarousel from '../components/StoryCarousel';
import MoodFilter from '../components/MoodFilter';
import Post from '../components/Post';
import GamificationWidget from '../components/GamificationWidget';
import './Feed.css';

import { compressAndUploadImage } from '../utils/upload';

const Feed = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCloseFriends, setIsCloseFriends] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostImage) return;

    setIsSubmitting(true);
    let imageUrl = null;
    let isVideo = false;
    
    if (newPostImage) {
      imageUrl = await compressAndUploadImage(newPostImage, 'posts');
      if (newPostImage.type.startsWith('video/')) {
        isVideo = true;
      }
    }

    try {
      await addDoc(collection(db, 'posts'), {
        author: user?.displayName || user?.email?.split('@')[0] || 'Unknown',
        content: newPostContent,
        image: imageUrl,
        isVideo: isVideo,
        isCloseFriends: isCloseFriends,
        likes: 0,
        createdAt: serverTimestamp()
      });
      setNewPostContent('');
      setNewPostImage(null);
      setIsCloseFriends(false);
    } catch (error) {
      console.error("Error adding post: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feed-page">
      <StoryCarousel user={user} />
      <MoodFilter />
      <GamificationWidget streak={14} level={7} xp={750} xpMax={1000} />
      
      <div className="create-post-container brutalist-card">
        <form onSubmit={handleCreatePost} className="create-post-form">
          <textarea 
            className="brutalist-input post-textarea"
            placeholder="What's your mood right now?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            disabled={isSubmitting}
            maxLength={280}
          />
          
          <div className="create-post-options" style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '0.5rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={(e) => setNewPostImage(e.target.files[0])} 
                disabled={isSubmitting}
                style={{ display: 'none' }}
                id="post-media-upload"
              />
              <span className="brutalist-button" style={{ backgroundColor: 'var(--pastel-blue)', padding: '0.5rem', display: 'inline-block' }}>
                {newPostImage ? 'Media Selected' : 'Add Photo/Video'}
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={isCloseFriends}
                onChange={(e) => setIsCloseFriends(e.target.checked)}
                disabled={isSubmitting}
              />
              Close Friends Only
            </label>
          </div>

          <div className="create-post-actions">
            <button 
              type="submit" 
              className="brutalist-button pink" 
              disabled={isSubmitting}
              data-testid="create-post-btn"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      <div className="feed-posts">
        {posts.map(post => (
          <Post 
            key={post.id}
            id={post.id}
            author={post.author}
            authorUid={post.authorUid}
            time={post.createdAt ? new Date(post.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
            image={post.image}
            isVideo={post.isVideo}
            isCloseFriends={post.isCloseFriends}
            content={post.content}
            initialLikes={post.likes}
            currentUser={user}
          />
        ))}
        {posts.length === 0 && (
          <div className="brutalist-card" style={{margin: '1rem', textAlign: 'center'}}>
            <p>No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
