document.getElementById("weather-form").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent default form submission
    const city = document.getElementById("city").value.trim(); // Get city input
    const weatherOption = document.getElementById("weather-option").value; // Get selected weather option
    
    document.getElementById("loading-weather").style.display = "block"; // Show loading message
    document.getElementById("error-message-weather").style.display = "none"; // Hide previous error messages
    document.getElementById("weather-data").style.display = "none"; // Hide previous weather data

    const apiKey = "YOUR_API_KEY"; // Replace with your actual API key

    let url = ""; // Initialize URL for API request

    // Determine API endpoint based on selected option
    if (weatherOption === "current" || weatherOption === "wind-speed" || weatherOption === "humidity" || weatherOption === "sunrise-sunset") {
        url = `http://127.0.0.1:5000/api/weather?city=${city}&weather_option=${weatherOption}`;
    } else if (weatherOption === "forecast") {
        url = `http://127.0.0.1:5000/api/weather?city=${city}&weather_option=forecast`;
    }

    try {
        const response = await fetch(url); // Fetch data from backend
        
        // Check if the response is okay
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Parse JSON response

        document.getElementById("loading-weather").style.display = "none"; // Hide loading message

        if (data.cod === 200) { // Check if response code is OK
            document.getElementById("weather-data").style.display = "block"; // Show weather data section
            document.getElementById("location").querySelector("span").textContent = `${data.name}, ${data.sys.country}`; // Display location

            // Handle different weather options accordingly...
            if (weatherOption === "current") {
                document.getElementById("temperature").querySelector("span").textContent = `${data.main.temp}°C`;
                document.getElementById("description").querySelector("span").textContent = `${data.weather[0].description}`;
            } else if (weatherOption === "wind-speed") {
                document.getElementById("temperature").style.display = "none";
                document.getElementById("description").style.display = "none";
                document.getElementById("location").innerHTML = `<strong>Wind Speed:</strong> ${data.wind.speed} m/s`;
            } else if (weatherOption === "humidity") {
                document.getElementById("temperature").style.display = "none";
                document.getElementById("description").style.display = "none";
                document.getElementById("location").innerHTML = `<strong>Humidity:</strong> ${data.main.humidity}%`;
            } else if (weatherOption === "sunrise-sunset") {
                const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
                const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
                document.getElementById("temperature").style.display = "none";
                document.getElementById("description").style.display = "none";
                document.getElementById("location").innerHTML = `<strong>Sunrise:</strong> ${sunriseTime}<br><strong>Sunset:</strong> ${sunsetTime}`;
            }
        } else {
            throw new Error(data.message || "An error occurred fetching weather data.");
        }
    } catch (error) {
        console.error(error);
        document.getElementById('loading-weather').style.display='none';
        document.getElementById('error-message-weather').textContent=error.message || 'An unexpected error occurred.'; 
        document.getElementById('error-message-weather').style.display='block'; 
    }
});