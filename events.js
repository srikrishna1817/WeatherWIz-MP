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
      card.className = 'bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition';
      
      const imageUrl = event.images && event.images.length > 0 
          ? event.images[0].url 
          : 'https://via.placeholder.com/300x200';

      card.innerHTML = `
          <img src="${imageUrl}" alt="${event.name}" class="w-full h-48 object-cover rounded-t-lg">
          <div class="mt-4">
              <h2 class="text-xl font-bold">${event.name}</h2>
              <p class="text-gray-600">${event.dates.start.localDate}</p>
              <p class="text-gray-500">${event._embedded?.venues?.[0]?.name || 'Venue Not Specified'}</p>
              <a href="${event.url}" target="_blank" class="mt-2 block bg-blue-500 text-white text-center p-2 rounded hover:bg-blue-600">
                  Buy Tickets
              </a>
          </div>
      `;

      return card;
  }
});