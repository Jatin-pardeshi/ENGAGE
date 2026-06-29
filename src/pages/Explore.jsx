import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { MagnifyingGlass } from '@phosphor-icons/react';
import './Explore.css';

const Explore = () => {
  const [popularPosts, setPopularPosts] = useState([]);

  useEffect(() => {
    // Fetch top 20 most liked posts
    const q = query(
      collection(db, 'posts'),
      orderBy('likes', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPopularPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="explore-page">
      <div className="explore-header brutalist-card">
        <div className="search-bar">
          <MagnifyingGlass size={24} weight="bold" />
          <input type="text" placeholder="Search topics, moods, or people..." className="brutalist-input search-input" />
        </div>
        <div className="trending-tags">
          <span className="badge">#PastelVibes</span>
          <span className="badge">#Brutalism</span>
          <span className="badge">#DailyGrind</span>
        </div>
      </div>

      <div className="explore-grid">
        {popularPosts.map((post, index) => (
          <div key={post.id} className={`explore-item ${index % 5 === 0 ? 'large' : ''}`}>
            {post.image ? (
              <img src={post.image} alt="post" />
            ) : (
              <div className="text-only-explore">
                <p>{post.content?.length > 50 ? post.content.substring(0, 50) + '...' : (post.content || '')}</p>
                <strong>{post.author || 'Unknown'}</strong>
              </div>
            )}
            <div className="explore-overlay">
              <span>{post.likes} Likes</span>
            </div>
          </div>
        ))}
        {popularPosts.length === 0 && (
          <p style={{padding: '1rem'}}>Nothing to explore yet. Be the first to post!</p>
        )}
      </div>
    </div>
  );
};

export default Explore;
