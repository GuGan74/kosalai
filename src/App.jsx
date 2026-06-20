import React, { Suspense, useEffect } from 'react';
import {
  BrowserRouter, Routes, Route,
  Navigate, useLocation,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';

import SplashPage from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import ListingDetailPage from './pages/ListingDetailPage';
import SearchPage from './pages/SearchPage';
import SellPage from './pages/SellPage';
import ProfilePage from './pages/ProfilePage';
import MyListingsPage from './pages/MyListingsPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import SellerProfilePage from './pages/SellerProfilePage';

/**
 * Utility to catch stale chunks (due to background Vite deployments) 
 * and force a hard reload. This allows the browser to fetch the new 
 * index.html with the updated chunk hashes without crashing.
 * Session storage is used to prevent infinite reload loops if a chunk 
 * is legitimately missing.
 */
const lazyRetry = function(componentImport) {
    return new Promise((resolve, reject) => {
        componentImport()
            .then((component) => {
                // Clear the flag on success so future background deployments can recover automatically
                sessionStorage.removeItem('chunk-retry');
                resolve(component);
            })
            .catch((error) => {
                if (error.message.includes('Failed to fetch dynamically imported module') || 
                    error.message.includes('Importing a module script failed') ||
                    error.message.includes('ChunkLoadError') ||
                    error.message.includes('Unable to preload CSS')) {
                    const hasRetried = sessionStorage.getItem('chunk-retry');
                    if (!hasRetried) {
                        sessionStorage.setItem('chunk-retry', 'true');
                        window.location.reload(true);
                    } else {
                        reject(error);
                    }
                } else {
                    reject(error);
                }
            });
    });
};

const NotificationsPage = React.lazy(() => lazyRetry(() => import('./pages/NotificationsPage')));
const PaymentPage = React.lazy(() => lazyRetry(() => import('./pages/PaymentPage')));
const SuccessPage = React.lazy(() => lazyRetry(() => import('./pages/SuccessPage')));
const NotFoundPage = React.lazy(() => lazyRetry(() => import('./pages/NotFoundPage')));
const AdminPage = React.lazy(() => lazyRetry(() => import('./pages/AdminPage')));
const AboutUsPage = React.lazy(() => lazyRetry(() => import('./pages/AboutUsPage')));
const PrivacyPolicyPage = React.lazy(() => lazyRetry(() => import('./pages/PrivacyPolicyPage')));
const TermsConditionsPage = React.lazy(() => lazyRetry(() => import('./pages/TermsConditionsPage')));
const HelpFaqPage = React.lazy(() => lazyRetry(() => import('./pages/HelpFaqPage')));
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import loadingGif from './assets/379.gif';
import loadingVideo from './assets/loading_splash.mp4';
import './index.css';
import './App.css';


function LazyFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', minHeight: '40vh'
    }}>
      <img src={loadingGif} alt="Loading..." style={{ width: 60, height: 60, objectFit: 'contain' }} />
    </div>
  );
}

// Redirects already-logged-in users away from login page
function AuthGuard({ children }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    const saved = sessionStorage.getItem('pb_redirect_after_login');
    if (saved) {
      sessionStorage.removeItem('pb_redirect_after_login');
      return <Navigate to={saved} replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

// Saves the URL the user wanted, then sends them to login
function LoginGuard({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    sessionStorage.setItem(
      'pb_redirect_after_login',
      location.pathname + location.search
    );
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const { isLoggedIn, isGuest, loading, needsProfileSetup } = useAuth();
  // Sync fallback: read localStorage directly to avoid
  // the React async state update race condition
  const isGuestNow = isGuest ||
    localStorage.getItem('pb_guest') === 'true';

  // Loading splash
  if (loading) {
    return (
      <div style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 9999,
        backgroundColor: '#000'
      }}>
        <video 
          src={loadingVideo}
          autoPlay 
          loop 
          muted 
          playsInline 
          preload="auto"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }}
          onError={(e) => {
            // Fallback to old gradient and gif if video fails
            e.target.style.display = 'none';
            document.getElementById('fallback-loading').style.display = 'flex';
          }}
        />
        
        {/* Fallback container (hidden by default) */}
        <div id="fallback-loading" style={{
          display: 'none',
          width: '100%', height: '100%',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(160deg,#0f5228 0%,#1a7a3c 55%,#0d3d1e 100%)',
          position: 'absolute', top: 0, left: 0, zIndex: 1
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🐄</div>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 28, fontWeight: 900 }}>
              Kosalai
            </div>
            <div style={{ marginTop: 20 }}>
              <img src={loadingGif} alt="Loading..." style={{ width: 80, height: 80, objectFit: 'contain' }} />
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ── Neither logged in NOR guest → Onboarding ──────────
  // Save current deep link so we can return here after login
  if (!isLoggedIn && !isGuestNow) {
    const currentPath = location.pathname + location.search;
    if (currentPath !== '/' && currentPath !== '/login') {
      sessionStorage.setItem('pb_redirect_after_login', currentPath);
    }
    return (
      <Suspense fallback={<LazyFallback />}>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={
            <AuthGuard>
              <SplashPage />
            </AuthGuard>
          } />
          <Route path="*" element={<OnboardingPage />} />
        </Routes>
      </Suspense>
    );
  }

  // New Google users must complete profile before accessing the app
  if (needsProfileSetup) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <Toaster position="top-center" />
        <Routes>
          <Route path="*" element={<ProfileSetupPage />} />
        </Routes>
      </Suspense>
    );
  }

  const hideNav = location.pathname === '/login';
  const hideBottomNav = hideNav || location.pathname.startsWith('/sell');

  // ── Guest OR logged-in → full app ─────────────────────
  return (
    <>
      <Toaster position="top-center" />
      {!hideNav && <Navbar />}
      <div style={{ paddingBottom: hideBottomNav ? 0 : 'var(--bottom-nav-h)' }}>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            {/* FREE — guests browse without login */}
            <Route path="/"
              element={<HomePage />} />
            <Route path="/search"
              element={<SearchPage />} />
            <Route path="/about-us"
              element={<AboutUsPage />} />
            <Route path="/privacy"
              element={<PrivacyPolicyPage />} />
            <Route path="/terms"
              element={<TermsConditionsPage />} />
            <Route path="/help"
              element={<HelpFaqPage />} />
            <Route path="/login"
              element={
                <AuthGuard>
                  <SplashPage />
                </AuthGuard>
              } />

            {/* PROTECTED — login required */}
            <Route path="/listing/:id"
              element={<ListingDetailPage />} />
            <Route path="/sell"
              element={
                <LoginGuard>
                  <SellPage />
                </LoginGuard>
              } />
            <Route path="/profile"
              element={
                <LoginGuard>
                  <ProfilePage />
                </LoginGuard>
              } />
            <Route path="/my-listings"
              element={
                <LoginGuard>
                  <MyListingsPage />
                </LoginGuard>
              } />
            <Route path="/notifications"
              element={
                <LoginGuard>
                  <NotificationsPage />
                </LoginGuard>
              } />
            <Route path="/payment"
              element={
                <LoginGuard>
                  <PaymentPage />
                </LoginGuard>
              } />
            <Route path="/success"
              element={
                <LoginGuard>
                  <SuccessPage />
                </LoginGuard>
              } />
            <Route path="/seller/:userId"
              element={<SellerProfilePage />} />
            <Route path="/admin"
              element={
                <LoginGuard>
                  <AdminPage />
                </LoginGuard>
              } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
