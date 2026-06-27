/**
 * Helper to safely send GA4 events only on production domain.
 */
function sendGaEvent(eventName, eventParams = {}) {
  const hostname = window.location.hostname;
  if (hostname !== 'kosalai.in' && hostname !== 'www.kosalai.in') {
    return; // Block analytics on localhost/preview
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
}

export function trackSignUp(method = 'google') {
  sendGaEvent('sign_up', { method });
}

export function trackLogin(method = 'google') {
  sendGaEvent('login', { method });
}

export function trackListingCreated(category, price) {
  sendGaEvent('create_listing', {
    item_category: category,
    value: price,
    currency: 'INR'
  });
}

export function trackSearch(searchTerm, category = 'all') {
  sendGaEvent('search', {
    search_term: searchTerm,
    item_category: category
  });
}

export function trackContactSeller(sellerId, method, category = null) {
  const params = {
    seller_id: sellerId,
    method: method
  };
  if (category) {
    params.item_category = category;
  }
  sendGaEvent('generate_lead', params);
}

export function trackViewItem(listing) {
  if (!listing) return;
  sendGaEvent('view_item', {
    item_id: listing.id,
    item_category: listing.category,
    item_variant: listing.breed,
    value: listing.price,
    currency: 'INR'
  });
}

export function trackShare(listingId, method = 'native') {
  sendGaEvent('share', {
    method,
    content_type: 'listing',
    item_id: listingId
  });
}
