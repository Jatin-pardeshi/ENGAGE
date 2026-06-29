import React, { useState, useEffect } from 'react';
import { Heart, ChatCircle, ShareFat, Sparkle, PaperPlaneRight } from '@phosphor-icons/react';
import { doc, updateDoc, increment, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import './Post.css';

const Post = ({ id, author, time, image, isVideo, isCloseFriends, content, initialLikes = 0, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <h3 className="post-author">{author}</h3>
            <span className="post-time">{time}</span>
          </div>
        </div>
        {isCloseFriends && (
          <div className="close-friends-badge">
            <Sparkle size={14} weight="fill" /> Close Friends
          </div>
        )}
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
