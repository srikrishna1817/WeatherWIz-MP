document.addEventListener('DOMContentLoaded', () => {
    // Safe element selection with fallback
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-events');
    const eventsContainer = document.getElementById('events-container');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error-message');

    // Check if critical elements exist
    if (!searchButton || !cityInput || !eventsContainer || !loadingElement || !errorElement) {
        console.error('One or more critical elements are missing');
        return;
    }

    const TICKETMASTER_API_KEY = 'jFhx9UG2VhHAQ0PR9yMSvN7At8Z3H07e';

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return 'Time TBA';
        const time = new Date(`2000-01-01T${timeStr}`);
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    searchButton.addEventListener('click', async () => {
        const city = cityInput.value.trim();

        if (!city) {
            errorElement.textContent = 'Please enter a city name';
            errorElement.style.display = 'block';
            return;
        }

        // Reset previous results
        eventsContainer.innerHTML = '';
        errorElement.style.display = 'none';
        loadingElement.style.display = 'block';

        try {
            const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_API_KEY}&city=${city}&size=9`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            loadingElement.style.display = 'none';

            if (data._embedded && data._embedded.events) {
                data._embedded.events.forEach(event => {
                    const eventCard = createEventCard(event);
                    eventsContainer.appendChild(eventCard);
                });
            } else {
                errorElement.textContent = 'No events found in this city';
                errorElement.style.display = 'block';
            }
        } catch (error) {
            loadingElement.style.display = 'none';
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });

    function createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition';
        
        const eventDate = event.dates?.start?.localDate ? formatDate(event.dates.start.localDate) : 'Date TBA';
        const eventTime = event.dates?.start?.localTime ? formatTime(event.dates.start.localTime) : 'Time TBA';
        const venue = event._embedded?.venues?.[0]?.name || 'Venue Not Specified';
        const genre = event.classifications?.[0]?.segment?.name || 'Genre Not Specified';
        
        // Get price range if available
        let priceRange = 'Price information not available';
        if (event.priceRanges && event.priceRanges[0]) {
            const min = event.priceRanges[0].min;
            const max = event.priceRanges[0].max;
            priceRange = `$${min} - $${max}`;
        }

        card.innerHTML = `
            <div class="mb-2">
                <h2 class="text-xl font-bold text-blue-800">${event.name}</h2>
            </div>
            <div class="text-gray-600 mb-2">
                <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>${eventDate}</span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>${eventTime}</span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>${venue}</span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span>${genre}</span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>${priceRange}</span>
                </div>
            </div>
            <div class="mt-4">
                <a href="${event.url}" target="_blank" class="block bg-blue-500 text-white text-center p-2 rounded hover:bg-blue-600 transition">
                    Buy Tickets
                </a>
            </div>
        `;

        return card;
    }
});
