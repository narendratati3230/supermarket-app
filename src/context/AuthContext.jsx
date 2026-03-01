import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('freshmart_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('freshmart_users') || '[]');
    const exists = users.find(u => u.email === userData.email);
    if (exists) return { success: false, error: 'Email already registered.' };

    const id = Date.now();
    const createdAt = new Date().toISOString();

    // Save full record (with password) to users list for future login
    const userRecord = { ...userData, id, createdAt };
    users.push(userRecord);
    localStorage.setItem('freshmart_users', JSON.stringify(users));

    // Save session without password
    const { password: _, ...sessionUser } = userRecord;
    localStorage.setItem('freshmart_user', JSON.stringify(sessionUser));
    setUser(sessionUser);

    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('freshmart_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const { password: _, ...userData } = found;
    localStorage.setItem('freshmart_user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('freshmart_user');
    setUser(null);
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('freshmart_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};