import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { GoogleLogo } from '@phosphor-icons/react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUserDoc = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.email.split('@')[0],
        avatarUrl: '',
        followers: [],
        following: [],
        xp: 0,
        level: 1,
        streak: 0,
        createdAt: new Date().toISOString()
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handleUserDoc(result.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let result;
      if (isRegistering) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      await handleUserDoc(result.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="brutalist-card login-card">
        <h1 className="login-title">ENGAGE</h1>
        <p className="login-subtitle">Join the brutalist social revolution.</p>
        
        {error && <div className="login-error">{error}</div>}

        <button 
          className="brutalist-button pink google-btn" 
          onClick={handleGoogleSignIn}
        >
          <GoogleLogo size={24} weight="bold" /> Sign in with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleEmailAuth} className="login-form">
          <input
            type="email"
            placeholder="Email"
            className="brutalist-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="brutalist-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="brutalist-button blue">
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <button 
          className="toggle-auth-mode" 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default Login;
