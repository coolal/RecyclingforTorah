import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { Submission, AdminCredentials } from './types';
import { LoginPage, SignUpPage } from './components/Auth';
import CollectionForm from './components/CollectionForm';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import { sampleSubmissions } from './constants';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (admin?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (admin = false) => {
    setIsLoggedIn(true);
    setIsAdmin(admin);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const value = useMemo(() => ({ isLoggedIn, isAdmin, login, logout }), [isLoggedIn, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
    const { isLoggedIn, isAdmin } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
};


function App() {
  const [submissions, setSubmissions] = useState<Submission[]>(sampleSubmissions);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
        const saved = localStorage.getItem('adminCredentials');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.email && parsed.password) {
                return parsed;
            }
        }
    } catch {
        // Ignore parsing errors and fall back to default
    }
    return { email: 'admin@recyclingfortorah.org', password: 'admin123' };
  });


  useEffect(() => {
    localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  const addSubmission = (submission: Omit<Submission, 'id' | 'timestamp' | 'status'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'Pending',
    };
    setSubmissions(prev => [newSubmission, ...prev]);
    // Simulate email notification to admin
    alert(`New pickup request from ${submission.name}! A notification has been sent to ${adminCredentials.email}.`);
  };

  const deleteSubmission = (id: number) => {
    setSubmissions(prev => prev.filter(submission => submission.id !== id));
  };

  return (
    <AuthProvider>
      <HashRouter>
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/login" element={<LoginPage adminCredentials={adminCredentials} />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CollectionForm addSubmission={addSubmission} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard 
                    submissions={submissions} 
                    setSubmissions={setSubmissions} 
                    deleteSubmission={deleteSubmission}
                    adminCredentials={adminCredentials}
                    setAdminCredentials={setAdminCredentials} 
                  />
                </ProtectedRoute>
              }
            />
             <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;