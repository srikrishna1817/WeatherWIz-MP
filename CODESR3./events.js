document.getElementById("searchButton").addEventListener("click", function () {
  const city = document.getElementById("cityInput").value.trim();

  if (city === "") {
    alert("Please enter a city name.");
    return;
  }

  // Make a request to the backend to get events for the entered city
  fetch(`http://localhost:5000/api/events?city=${encodeURIComponent(city)}`)
    .then((response) => response.json())
    .then((data) => {
      const eventsList = document.getElementById("eventsList");
      eventsList.innerHTML = ""; // Clear any previous events

      if (data.error) {
        eventsList.innerHTML = `<p>${data.error}</p>`;
        return;
      }

      // Loop through events and display them
      data.events.forEach((event) => {
        const eventItem = document.createElement("div");
        eventItem.classList.add("event-item");

        eventItem.innerHTML = `
                    <h3>${event.name}</h3>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <a href="${event.link}" target="_blank">More Details</a>
                `;

        eventsList.appendChild(eventItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      eventsList.innerHTML = `<p>Failed to load events. Please try again later.</p>`;
    });
});
