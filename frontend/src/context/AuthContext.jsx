// ============================================================
// FILE: src/context/AuthContext.jsx
// Global authentication context with Supabase session persistence
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { usersAPI, authAPI } from '../services/api';

const AuthContext = createContext(null);

// Hardcoded areas for the app
export const AREAS = [
  "New Bus Stand", "Old Bus Stand", "Millerpuram", "3rd Mile",
  "Bryant Nagar", "Therespuram", "Harbour Area", "SPIC Nagar",
  "Kattur", "VOC Nagar",
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from backend
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await usersAPI.getProfile();
      setProfile(data.profile);
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
  }, []);

  // Initialize auth state from Supabase
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);
        // Store session for API interceptor
        localStorage.setItem('supabase_session', JSON.stringify({
          access_token: existingSession.access_token,
          refresh_token: existingSession.refresh_token,
        }));
        fetchProfile();
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event:', event);

        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          localStorage.setItem('supabase_session', JSON.stringify({
            access_token: newSession.access_token,
            refresh_token: newSession.refresh_token,
          }));
          fetchProfile();
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          localStorage.removeItem('supabase_session');
        }

        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [fetchProfile]);

  // Register a new user
  const register = async ({ name, phone, role, email, password }) => {
    const { data } = await authAPI.register({ name, phone, role, email, password });
    return data;
  };

  // Login with email/password (for MVP) or phone/OTP
  const login = async ({ email, password, phone, otp }) => {
    if (email && password) {
      // Email login via Supabase client
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else if (phone && otp) {
      const { data } = await authAPI.login({ phone, otp });
      return data;
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    localStorage.removeItem('supabase_session');
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    fetchProfile,
    AREAS,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
