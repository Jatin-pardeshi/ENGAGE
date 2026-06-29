import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { PaperPlaneRight, User } from '@phosphor-icons/react';
import './Messages.css';

const Messages = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // For this prototype, we'll use a global 'global_chat' collection
  useEffect(() => {
    const q = query(
      collection(db, 'global_chat'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'global_chat'), {
        text: newMessage,
        authorId: user.uid,
        authorName: user.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-sidebar brutalist-card">
        <h3>Conversations</h3>
        <div className="conversation-item active">
          <div className="convo-avatar"><User size={24} /></div>
          <div className="convo-details">
            <h4>Global Chat</h4>
            <p>Tap to join the community!</p>
          </div>
        </div>
      </div>

      <div className="chat-area brutalist-card">
        <div className="chat-header">
          <h3>Global Chat</h3>
        </div>
        
        <div className="chat-history">
          {messages.map(msg => {
            const isMe = msg.authorId === user?.uid;
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMe ? 'mine' : 'theirs'}`}>
                {!isMe && <span className="chat-author">{msg.authorName}</span>}
                <div className={`chat-bubble ${isMe ? 'pink' : 'blue'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <p className="empty-chat">No messages yet. Say hi!</p>}
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            className="brutalist-input" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="brutalist-button yellow">
            <PaperPlaneRight size={24} weight="fill" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
