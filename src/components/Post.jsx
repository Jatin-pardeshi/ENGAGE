import React, { useState, useEffect } from 'react';
import { Heart, ChatCircle, ShareFat, Sparkle, PaperPlaneRight, DotsThree, Trash } from '@phosphor-icons/react';
import { doc, updateDoc, increment, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Post.css';

const Post = ({ id, author, authorUid, time, image, isVideo, isCloseFriends, content, initialLikes = 0, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true); // Default true so it doesn't flash

  useEffect(() => {
    // Check if following
    const checkFollowing = async () => {
      if (!currentUser || !authorUid || currentUser.uid === authorUid) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const following = userSnap.data().following || [];
          setIsFollowing(following.includes(authorUid));
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkFollowing();
  }, [currentUser, authorUid]);

  const handleFollow = async () => {
    if (!currentUser || !authorUid) return;
    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        following: arrayUnion(authorUid)
      });
      const authorRef = doc(db, 'users', authorUid);
      await updateDoc(authorRef, {
        followers: arrayUnion(currentUser.uid)
      });
      setIsFollowing(true);
      alert(`You are now following ${author}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (!showComments) return;
    
    const q = query(
      collection(db, 'posts', id, 'comments'), 
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [id, showComments]);

  const toggleLike = async () => {
    if (liked) return; 
    setLiked(true);
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error("Error updating likes:", error);
      setLiked(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts', id, 'comments'), {
        author: currentUser.displayName || currentUser.email.split('@')[0],
        content: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className={`brutalist-card post-card ${isCloseFriends ? 'close-friends-post' : ''}`}>
      <div className="post-header">
        <div className="post-author-info">
          <div className="post-avatar"></div>
          <div>
            <h3 className="post-author" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              {author}
              {currentUser && authorUid && currentUser.uid !== authorUid && !isFollowing && (
                <button 
                  onClick={handleFollow}
                  className="brutalist-button pink"
                  style={{padding: '2px 8px', fontSize: '0.7rem'}}
                >
                  Follow
                </button>
              )}
            </h3>
            <span className="post-time">{time}</span>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          {isCloseFriends && (
            <div className="close-friends-badge">
              <Sparkle size={14} weight="fill" /> Close Friends
            </div>
          )}
          {currentUser && currentUser.uid === authorUid && (
            <div style={{position: 'relative'}}>
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem'}}
              >
                <DotsThree size={24} weight="bold" />
              </button>
              {showMenu && (
                <div className="brutalist-card" style={{
                  position: 'absolute', right: 0, top: '30px', 
                  padding: '0.5rem', background: '#fff', zIndex: 10,
                  minWidth: '100px'
                }}>
                  <button 
                    onClick={handleDelete}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', 
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      color: 'red', width: '100%', textAlign: 'left'
                    }}
                  >
                    <Trash size={16} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {image && (
        <div className="post-media">
          {isVideo ? (
            <video src={image} controls playsInline style={{width: '100%', display: 'block', maxHeight: '500px', backgroundColor: '#000'}} />
          ) : (
            <img src={image} alt="Post content" />
          )}
        </div>
      )}

      <div className="post-content">
        <p>{content}</p>
        <div className="ai-caption-badge">
          <Sparkle size={16} /> AI Enhanced
        </div>
      </div>

      <div className="post-actions">
        <button 
          className={`brutalist-button action-btn ${liked ? 'pink active' : ''}`}
          onClick={toggleLike}
          data-testid="post-like-btn"
        >
          <Heart size={24} weight={liked ? 'fill' : 'bold'} /> {initialLikes}
        </button>
        <button 
          className={`brutalist-button action-btn ${showComments ? 'blue active' : 'blue'}`}
          onClick={() => setShowComments(!showComments)}
        >
          <ChatCircle size={24} weight="bold" />
        </button>
        <button className="brutalist-button action-btn green">
          <ShareFat size={24} weight="bold" />
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map(c => (
              <div key={c.id} className="comment-item">
                <strong>{c.author}</strong> {c.content}
              </div>
            ))}
            {comments.length === 0 && <p className="no-comments">No comments yet. Start the conversation!</p>}
          </div>
          <form className="comment-input-form" onSubmit={handleAddComment}>
            <input 
              type="text" 
              className="brutalist-input" 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <button type="submit" className="brutalist-button yellow submit-comment-btn" disabled={isSubmitting}>
              <PaperPlaneRight size={20} weight="fill" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default Post;
