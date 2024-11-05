document.getElementById('weather-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const city = document.getElementById('city').value;
    const weatherOption = document.getElementById('weather-option').value;

    // Show loading message
    document.getElementById('loading').style.display = 'block';
    document.getElementById('weather-data').style.display = 'none';
    document.getElementById('forecast').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';

    const apiKey = '5587c509f668933659fdd7a834900c45'; // Replace with your actual API key
    let url;

    if (weatherOption === 'current') {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (weatherOption === 'wind-speed') {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (weatherOption === 'humidity') {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (weatherOption === 'sunrise-sunset') {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (weatherOption === 'forecast') {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('weather-data').style.display = 'block';

            if (weatherOption === 'current' || weatherOption === 'wind-speed' || weatherOption === 'humidity' || weatherOption === 'sunrise-sunset') {
                displayCurrentWeather(data, weatherOption);
            } else if (weatherOption === 'forecast') {
                displayForecast(data);
            }
        })
        .catch(error => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error-message').style.display = 'block';
            console.error('There was a problem with the fetch operation:', error);
        });
});

function displayCurrentWeather(data, option) {
    const location = document.getElementById('location').querySelector('span');
    const temperature = document.getElementById('temperature').querySelector('span');
    const description = document.getElementById('description').querySelector('span');

    location.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${data.main.temp} °C`;

    if (option === 'wind-speed') {
        description.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    } else if (option === 'humidity') {
        description.textContent = `Humidity: ${data.main.humidity}%`;
    } else if (option === 'sunrise-sunset') {
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        description.textContent = `Sunrise: ${sunrise}, Sunset: ${sunset}`;
    } else {
        description.textContent = `${data.weather[0].description}`;
    }
}

function displayForecast(data) {
    const forecastDiv = document.getElementById('forecast');
    forecastDiv.style.display = 'block';

    const forecastDays = data.list.filter(item => item.dt_txt.includes("12:00:00")); // Get only the 12 PM forecast
    forecastDays.forEach((item, index) => {
        if (index < 5) {
            const day = new Date(item.dt * 1000).toLocaleDateString();
            const temp = item.main.temp;
            const description = item.weather[0].description;

            document.getElementById(`day${index + 1}`).textContent = `${day}: ${temp} °C, ${description}`;
        }
    });
}
