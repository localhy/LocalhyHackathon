import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProblemStatement from './components/ProblemStatement';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import UseCases from './components/UseCases';
import Benefits from './components/Benefits';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import IdeasVault from './components/IdeasVault';
import IdeaDetail from './components/IdeaDetail';
import EditIdeaDetail from './components/EditIdeaDetail';
import ReferralJobs from './components/ReferralJobs';
import ReferralJobDetail from './components/ReferralJobDetail';
import EditReferralJobDetail from './components/EditReferralJobDetail';
import StarterTools from './components/StarterTools';
import CreatePost from './components/CreatePost';
import MyPosts from './components/MyPosts';
import Wallet from './components/Wallet';
import Profile from './components/Profile';
import Settings from './components/Settings';

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <Header />
    <Hero />
    <ProblemStatement />
    <Features />
    <HowItWorks />
    <UseCases />
    <Benefits />
    <Footer />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/ideas-vault" 
            element={
              <ProtectedRoute>
                <IdeasVault />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/ideas/:id" 
            element={
              <ProtectedRoute>
                <IdeaDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/my-posts/edit/idea/:id" 
            element={
              <ProtectedRoute>
                <EditIdeaDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/referral-jobs" 
            element={
              <ProtectedRoute>
                <ReferralJobs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/referral-jobs/:id" 
            element={
              <ProtectedRoute>
                <ReferralJobDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/my-posts/edit/referral/:id" 
            element={
              <ProtectedRoute>
                <EditReferralJobDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/starter-tools" 
            element={
              <ProtectedRoute>
                <StarterTools />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/create-new" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/my-posts/edit/:type/:id" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/my-posts" 
            element={
              <ProtectedRoute>
                <MyPosts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/wallet" 
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;