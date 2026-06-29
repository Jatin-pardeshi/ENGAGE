import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Heart, ChatCircle, ShareFat, MusicNotes } from '@phosphor-icons/react';
import './Reels.css';

const Reels = ({ user }) => {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    // Fetch only posts that are videos
    const q = query(
      collection(db, 'posts'),
      where('isVideo', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReels(reelsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="reels-container">
      {reels.length === 0 ? (
        <div className="no-reels">
          <h2>No Reels yet!</h2>
          <p>Go to the feed and upload a video post to start the trend.</p>
        </div>
      ) : (
        reels.map(reel => (
          <Reel key={reel.id} reel={reel} currentUser={user} />
        ))
      )}
    </div>
  );
};

const Reel = ({ reel, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const videoRef = useRef(null);

  // Intersection observer to play/pause video when it enters/leaves viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log("Autoplay prevented:", e));
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  // Comments listener
  useEffect(() => {
    if (!showComments) return;
    const q = query(collection(db, 'posts', reel.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [reel.id, showComments]);

  const toggleLike = async () => {
    if (liked) return;
    setLiked(true);
    await updateDoc(doc(db, 'posts', reel.id), { likes: increment(1) });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    await addDoc(collection(db, 'posts', reel.id, 'comments'), {
      author: currentUser.displayName || currentUser.email.split('@')[0],
      content: newComment,
      createdAt: serverTimestamp()
    });
    setNewComment('');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reel by @${reel.author}`,
          text: reel.content,
          url: window.location.href, // In a real app, this would be a deep link to the reel
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      alert("Sharing is not supported on this browser. Copy the URL instead!");
    }
  };

  return (
    <div className="reel-item">
      <video 
        ref={videoRef}
        src={reel.image} 
        className="reel-video"
        loop 
        playsInline
        muted={false} // Might need to be true initially depending on browser policy
        onClick={() => {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }}
      />
      
      <div className="reel-overlay">
        <div className="reel-info">
          <h3>@{reel.author}</h3>
          <p>{reel.content}</p>
          <div className="reel-music">
            <MusicNotes size={16} /> <span>Original Audio - @{reel.author}</span>
          </div>
        </div>

        <div className="reel-actions brutalist-card">
          <button className={`reel-action-btn ${liked ? 'pink active' : ''}`} onClick={toggleLike}>
            <Heart size={32} weight={liked ? "fill" : "regular"} />
            <span>{reel.likes || 0}</span>
          </button>
          <button className="reel-action-btn blue" onClick={() => setShowComments(!showComments)}>
            <ChatCircle size={32} weight="regular" />
            <span>{comments.length || 0}</span>
          </button>
          <button className="reel-action-btn yellow" onClick={handleShare}>
            <ShareFat size={32} weight="regular" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="reel-comments-drawer brutalist-card">
          <div className="drawer-header">
            <h4>Comments</h4>
            <button onClick={() => setShowComments(false)} className="close-btn">X</button>
          </div>
          <div className="reel-comments-list">
            {comments.map(c => (
              <div key={c.id} className="reel-comment">
                <strong>{c.author}</strong> {c.content}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="reel-comment-form">
            <input 
              type="text" 
              className="brutalist-input" 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button type="submit" className="brutalist-button pink">Post</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reels;
