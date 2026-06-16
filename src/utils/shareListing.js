export async function shareListing(listing) {
    if (!listing || !listing.id) return false;
    
    const url = `https://kosalai.in/listing/${listing.listing_code || listing.id}`;
    const shareData = {
        title: listing.title || 'Kosalai Listing',
        text: 'Check out this listing on Kosalai',
        url: url
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            return true;
        } else {
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
            return true;
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            try {
                await navigator.clipboard.writeText(url);
                alert("Link copied to clipboard!");
                return true;
            } catch (e) {
                console.error("Failed to copy link", e);
            }
        }
        return false;
    }
}
