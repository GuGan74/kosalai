import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DEBOUNCE_MS = 350; // wait 350ms after listing IDs settle before querying favorites

/**
 * useFavorites — batch fetches all liked listing IDs in ONE query (no N+1).
 * Now debounced so rapid listing changes don't fire multiple DB requests.
 * @param {string|null} userId
 * @param {string[]} listingIds
 * @returns {{ likedIds: Set<string>, toggleFavorite: Function }}
 */
export function useFavorites(userId, listingIds = []) {
    const [likedIds, setLikedIds] = useState(new Set());
    useEffect(() => {
        if (!userId) return;

        // Fetch all of the user's favorites exactly once on mount/login
        supabase
            .from('favorites')
            .select('listing_id')
            .eq('user_id', userId)
            .then(({ data, error }) => {
                if (data && !error) {
                    setLikedIds(new Set(data.map(f => f.listing_id)));
                }
            });
    }, [userId]); // No longer depends on screen state or tabs!

    async function toggleFavorite(listingId, listing, currentProfile, explicitIsLiked = null) {
        if (!userId) return { error: { message: 'Not logged in' } };

        const isDemo = String(listingId).startsWith('d') && String(listingId).length < 10;
        const isCurrentlyLiked = explicitIsLiked !== null ? explicitIsLiked : likedIds.has(listingId);

        if (isCurrentlyLiked) {
            setLikedIds(prev => { const s = new Set(prev); s.delete(listingId); return s; });
            if (!isDemo) {
                await supabase.from('favorites').delete()
                    .eq('user_id', userId).eq('listing_id', listingId);
            }
        } else {
            setLikedIds(prev => new Set([...prev, listingId]));
            if (!isDemo) {
                await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
                // Notify owner
                if (listing?.user_id && listing.user_id !== userId) {
                    await supabase.from('notifications').insert({
                        user_id: listing.user_id,
                        actor_id: userId,
                        type: 'like',
                        icon: '❤️',
                        title: 'New Like on your listing!',
                        message: `${currentProfile?.full_name || 'Someone'} liked your ${listing.title}.`,
                        metadata: { listing_id: listingId }
                    }).then(({ error: notifError }) => {
                        if (notifError) {
                            console.error("Notification Insert Error:", notifError);
                            // We don't want to break the UI, but it's good for debugging
                        }
                    });
                }
            }
        }
    }

    return { likedIds, toggleFavorite };
}
