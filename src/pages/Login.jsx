import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { GoogleLogo } from '@phosphor-icons/react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
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
