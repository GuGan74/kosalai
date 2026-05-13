import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('user');

    // ── Guest mode ──────────────────────────────────────────
    const [isGuest, setIsGuest] = useState(() => {
        try { return localStorage.getItem('pb_guest') === 'true'; }
        catch { return false; }
    });
    const [guestPrefs, setGuestPrefs] = useState(() => {
        try {
            const raw = localStorage.getItem('pb_guest_prefs');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    });

    // Cattle/Pets toggle — persisted across sessions
    const [listingType, setListingTypeState] = useState(() => {
        try { return localStorage.getItem('ks_listing_type') || 'livestock'; }
        catch { return 'livestock'; }
    });

    function setListingType(type) {
        setListingTypeState(type);
        try { localStorage.setItem('ks_listing_type', type); } catch (err) { console.error('LocalStorage error:', err); }
    }

    function enterGuestMode(prefs = {}) {
        setIsGuest(true);
        setGuestPrefs(prefs);
        try {
            localStorage.setItem('pb_guest', 'true');
            localStorage.setItem('pb_guest_prefs', JSON.stringify(prefs));
        } catch (err) {
            console.error('Failed to set guest preference:', err);
        }
    }

    function clearGuestMode() {
        setIsGuest(false);
        try {
            localStorage.removeItem('pb_guest');
            // pb_guest_prefs intentionally kept — used post-login
        } catch (err) {
            console.error('Failed to clear guest mode flag:', err);
        }
    }
    // ────────────────────────────────────────────────────────

    const loadProfile = React.useCallback(async (uid) => {
        if (!uid) return;
        const { data, error } = await supabase
            .from('profiles').select('*').eq('id', uid).single();
        if (data && !error) {
            setCurrentProfile(data);
            setUserRole(data.role || 'user');
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        const fallbackTimer = setTimeout(() => {
            if (mounted) setLoading(false);
        }, FALLBACK_MS);

        // Initial session check
        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            if (error) console.error("Session error:", error);
            
            if (session && mounted) {
                setCurrentUser(session.user);
                setIsLoggedIn(true);
                clearGuestMode();
                loadProfile(session.user.id);
            } else if (!session && mounted) {
                setIsLoggedIn(false);
            }

            if (mounted) {
                setLoading(false);
                clearTimeout(fallbackTimer);
            }
        }).catch((err) => {
            console.error("Session fetch rejected:", err);
            if (mounted) {
                setLoading(false);
                clearTimeout(fallbackTimer);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        setCurrentUser(session.user);
                        if (event === 'SIGNED_IN') {
                            await loadProfile(session.user.id);
                            clearGuestMode();
                            setIsLoggedIn(true);
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                    setCurrentProfile(null);
                    setIsLoggedIn(false);
                    setUserRole('user');
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, [loadProfile]);

    async function signInWithGoogle() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/' },
        });
        return { error };
    }

    async function signOut() {
        setCurrentUser(null);
        setCurrentProfile(null);
        setIsLoggedIn(false);
        setUserRole('user');
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        try {
            localStorage.removeItem('pb_sess');
            localStorage.removeItem('pb_guest');
            localStorage.removeItem('pb_guest_prefs');
        } catch { /* ignore */ }
        clearGuestMode();
    }

    async function saveInterest(listingId, listingTitle) {
        if (!currentUser) return { error: { message: 'Not logged in' } };
        return await supabase.from('interests').insert({
            user_id: currentUser.id,
            listing_id: listingId,
            listing_title: listingTitle,
            contacted_at: new Date().toISOString(),
        });
    }

    const value = React.useMemo(() => ({
        currentUser,
        currentProfile,
        isLoggedIn,
        loading,
        userRole,
        setUserRole,
        isGuest,
        guestPrefs,
        listingType,
        setListingType,
        enterGuestMode,
        signInWithGoogle,
        signOut,
        saveInterest,
        loadProfile,
        needsProfileSetup: isLoggedIn &&
            currentProfile !== null &&
            !currentProfile?.is_profile_complete,
    }), [
        currentUser, currentProfile, isLoggedIn, loading, 
        userRole, isGuest, guestPrefs, listingType, loadProfile
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
