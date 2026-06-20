import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { currentUser, isLoggedIn, isGuest } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!currentUser || isGuest) return;
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id)
                .eq('is_read', false);

            if (!error && count !== null) {
                setUnreadCount(count);
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, [currentUser, isGuest]);

    useEffect(() => {
        if (!isLoggedIn || !currentUser || isGuest) {
            setUnreadCount(0);
            return;
        }

        fetchUnreadCount();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`notifs-badge-${currentUser.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${currentUser.id}`
            }, () => {
                fetchUnreadCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, isLoggedIn, isGuest, fetchUnreadCount]);

    const markAllReadGlobally = useCallback(async () => {
        if (!currentUser || isGuest) return;
        setUnreadCount(0); // Optimistic update
        const { data, error, count } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', currentUser.id)
            .eq('is_read', false)
            .select();
            
        console.log('[MarkAllRead] Supabase Response:', { data, error, count });
        
        if (error) {
            console.error('Failed to mark notifications as read in DB:', error);
            return false;
        }
        
        // Remove the aggressive zero-row check since it throws false positives if the DB is already in sync.
        // If the query executed without `error`, we consider it a success.
        
        fetchUnreadCount();
        return true;
    }, [currentUser, isGuest, fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount, markAllReadGlobally }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationBadge() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationBadge must be used within a NotificationProvider');
    }
    return context;
}
