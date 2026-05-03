/**
 * Adapts API event data to the shape expected by existing UI components.
 * This avoids touching any UI components (EventCard, EventDetails, etc.)
 */

// Default fallback images by category
const categoryImages = {
    esports: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    sports: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    cultural: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    tech: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    seminar: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    workshop: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    other: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
};

// Map API category values to UI display names
const categoryDisplayNames = {
    esports: 'E-Sports',
    sports: 'Sports',
    concert: 'Concert',
    cultural: 'Qawali',
    tech: 'Auto Show',
    seminar: 'Seminar',
    workshop: 'Workshop',
    other: 'Other',
};

/**
 * Formats a date string consistently as "May 02, 2026".
 * Handles ISO strings, Date objects, and plain date strings.
 */
export function formatEventDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // If not parseable, return as-is
        return dateString;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
}

/**
 * Adapts a single event from API shape to the UI shape.
 */
export function adaptEvent(apiEvent) {
    if (!apiEvent) return null;

    return {
        // Map _id to id for React keys and routing
        id: apiEvent._id,
        _id: apiEvent._id,
        title: apiEvent.title || '',
        description: apiEvent.description || '',
        category: categoryDisplayNames[apiEvent.category] || apiEvent.category || 'Other',
        date: formatEventDate(apiEvent.date),
        time: apiEvent.startTime || '',
        venue: apiEvent.venue || '',
        capacity: apiEvent.capacity || 0,
        registered: apiEvent.registeredCount || 0,
        price: apiEvent.fee || 0,
        image: apiEvent.banner || categoryImages[apiEvent.category] || categoryImages.other,
        status: apiEvent.status || 'upcoming',
        isFree: apiEvent.isFree,
        startTime: apiEvent.startTime,
        endTime: apiEvent.endTime,
        createdBy: apiEvent.createdBy,
    };
}

/**
 * Adapts an array of API events.
 */
export function adaptEvents(apiEvents) {
    if (!Array.isArray(apiEvents)) return [];
    return apiEvents.map(adaptEvent);
}
