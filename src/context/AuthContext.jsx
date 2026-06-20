import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const FALLBACK_MS = 10000;
    // Supabase stores the token under this key — check it synchronously
    const SB_KEY = `sb-ulbrlhcelwoojwnvznrd-auth-token`;

    // Synchronous check: if we have a token, parse it to avoid race conditions
    // This eliminates the green splash screen on refresh AND prevents the "reset" flash
    const storedSession = (() => {
        try {
            const raw = localStorage.getItem(SB_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch { return null; }
    })();

    const [currentUser, setCurrentUser] = useState(storedSession?.user || null);
    
    // Fallback profile from JWT metadata to prevent UI flashes before loadProfile finishes
    const [currentProfile, setCurrentProfile] = useState(() => {
        if (!storedSession?.user) return null;
        const meta = storedSession.user.user_metadata || {};
        return {
            id: storedSession.user.id,
            full_name: meta.full_name || meta.name || '',
            avatar_url: meta.avatar_url || meta.picture || '',
            email: storedSession.user.email || '',
        };
    });

    const [isLoggedIn, setIsLoggedIn] = useState(!!storedSession); 
    const [loading, setLoading] = useState(true); // Explicit loading gate to prevent premature routing
    const [profileReady, setProfileReady] = useState(false); // Tracks if DB profile fetch is complete
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

    const loadProfile = React.useCallback(async (uid, retries = 3) => {
        if (!uid) {
            setProfileReady(true);
            return;
        }
        
        let success = false;
        for (let i = 0; i < retries; i++) {
            try {
                // Use Promise.race to prevent infinite hangs if Supabase locks deadlock
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 5000));
                const fetchPromise = supabase.from('profiles').select('*').eq('id', uid).single();
                
                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (error) throw error;
                if (data) {
                    console.log('PROFILE_FETCH_SUCCESS');
                    setCurrentProfile(data);
                    setUserRole(data.role || 'user');
                    success = true;
                    break;
                }
            } catch (err) {
                console.error(`Failed to load profile (attempt ${i + 1}):`, err);
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2s backoff
                }
            }
        }
        
        if (!success) {
            console.error("CRITICAL: Exhausted all retries fetching profile. Falling back to safe defaults.");
        }
        
        setProfileReady(true);
    }, []);

    const profileFetchStarted = React.useRef(false);

    useEffect(() => {
        let mounted = true;
        const fallbackTimer = setTimeout(() => {
            if (mounted) setLoading(false);
        }, FALLBACK_MS);

        const initSession = async () => {
            try {
                // OPTIMIZATION 1: If there is no local session, they are a guest/new user.
                // We can instantly hide the loading screen!
                if (!storedSession && mounted) {
                    setLoading(false);
                    setProfileReady(true);
                }

                // OPTIMIZATION 2: If we have a stored session, fetch BOTH the session and the profile in parallel!
                // This cuts the perceived loading time in half.
                let sessionResult = null;
                
                if (storedSession?.user?.id && !profileFetchStarted.current) {
                    profileFetchStarted.current = true;
                    console.log('PROFILE_FETCH_START [Parallel Init]');
                    const [sessionResp] = await Promise.all([
                        supabase.auth.getSession(),
                        loadProfile(storedSession.user.id)
                    ]);
                    sessionResult = sessionResp;
                } else {
                    sessionResult = await supabase.auth.getSession();
                }

                const { data: { session }, error } = sessionResult;
                if (error) console.error("Session error:", error);
                
                if (session && mounted) {
                    setCurrentUser(session.user);
                    setIsLoggedIn(true);
                    clearGuestMode();
                    
                    // Fallback in case parallel fetch was skipped
                    if (!profileFetchStarted.current) {
                        profileFetchStarted.current = true;
                        await loadProfile(session.user.id);
                    }
                } else if (!session && mounted) {
                    setIsLoggedIn(false);
                    setProfileReady(true);
                }

                if (mounted) {
                    setLoading(false);
                    clearTimeout(fallbackTimer);
                }
            } catch (err) {
                console.error("Session fetch rejected:", err);
                if (mounted) {
                    setLoading(false);
                    setProfileReady(true);
                    clearTimeout(fallbackTimer);
                }
            }
        };
        
        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        setCurrentUser(session.user);
                        if (event === 'SIGNED_IN') {
                            if (!profileFetchStarted.current) {
                                profileFetchStarted.current = true;
                                console.log('PROFILE_FETCH_START [onAuthStateChange]', event);
                                await loadProfile(session.user.id);
                            } else {
                                console.log('PROFILE_FETCH_SKIPPED [onAuthStateChange]', event);
                            }
                            clearGuestMode();
                            setIsLoggedIn(true);
                        }
                    }
                } else if (event === 'SIGNED_OUT') {
                    profileFetchStarted.current = false;
                    setCurrentUser(null);
                    setCurrentProfile(null);
                    setIsLoggedIn(false);
                    setUserRole('user');
                    setProfileReady(true);
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

    // STRICT CHECK: Only force setup if we definitively loaded the profile AND it is explicitly marked false.
    // If it is undefined (due to network timeout/fallback), we assume true to prevent data destruction.
    const needsProfileSetupFlag = isLoggedIn &&
        profileReady &&
        currentProfile !== null &&
        currentProfile?.is_profile_complete === false;

    console.log('[DEBUG] AuthState:', {
        isLoggedIn,
        profileReady,
        currentProfile,
        needsProfileSetup: needsProfileSetupFlag
    });

    const value = React.useMemo(() => ({
        currentUser,
        currentProfile,
        profileReady,
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
        needsProfileSetup: needsProfileSetupFlag,
    }), [
        currentUser, currentProfile, profileReady, isLoggedIn, loading, 
        userRole, isGuest, guestPrefs, listingType, loadProfile, needsProfileSetupFlag
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
