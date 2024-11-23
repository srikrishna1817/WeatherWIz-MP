document.getElementById("weather-form").addEventListener("submit", function (event) {
  event.preventDefault();

  const city = document.getElementById("city").value;
  const weatherOption = document.getElementById("weather-option").value;

  toggleVisibility("loading", true);
  toggleVisibility("weather-data", false);
  toggleVisibility("forecast", false);
  toggleVisibility("error-message", false);

  const apiKey = "5587c509f668933659fdd7a834900c45";
  let url = constructApiUrl(city, weatherOption, apiKey);

  if (weatherOption === "air-quality") {
      fetchGeocodingAndAirQuality(city, apiKey);
  } else {
      fetchWeatherData(url, weatherOption);
  }
});

function fetchGeocodingAndAirQuality(city, apiKey) {
  // First get coordinates for the city
  const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
  
  fetch(geocodingUrl)
      .then(response => response.json())
      .then(data => {
          if (data.length > 0) {
              const { lat, lon } = data[0];
              const airQualityUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
              return fetch(airQualityUrl);
          } else {
              throw new Error("City not found");
          }
      })
      .then(response => response.json())
      .then(data => {
          toggleVisibility("loading", false);
          displayAirQuality(data, city);
          toggleVisibility("weather-data", true);
      })
      .catch(error => {
          console.error("Error:", error);
          toggleVisibility("loading", false);
          toggleVisibility("error-message", true);
      });
}

function constructApiUrl(city, weatherOption, apiKey) {
  if (
      weatherOption === "current" ||
      weatherOption === "feels-like" ||
      weatherOption === "rain-probability" ||
      weatherOption === "wind-speed" ||
      weatherOption === "humidity" ||
      weatherOption === "sunrise-sunset"
  ) {
      return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  } else if (weatherOption === "forecast") {
      return `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  }
  return null;
}

function fetchWeatherData(url, weatherOption) {
  if (!url) {
      console.error("Invalid URL");
      toggleVisibility("error-message", true);
      return;
  }

  fetch(url)
      .then((response) => {
          if (!response.ok) {
              throw new Error("Network response was not ok");
          }
          return response.json();
      })
      .then((data) => {
          toggleVisibility("loading", false);

          if (weatherOption === "forecast") {
              displayForecast(data);
              toggleVisibility("forecast", true);
              redirectToEventsPage();
          } else {
              displayCurrentWeather(data, weatherOption);
              toggleVisibility("weather-data", true);
              checkWeatherAlerts(data);
          }
      })
      .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          toggleVisibility("loading", false);
          toggleVisibility("error-message", true);
      });
}

function getAQILevel(aqi) {
  switch(aqi) {
      case 1: return { level: "Good", class: "aqi-good" };
      case 2: return { level: "Fair", class: "aqi-moderate" };
      case 3: return { level: "Moderate", class: "aqi-moderate" };
      case 4: return { level: "Poor", class: "aqi-unhealthy" };
      case 5: return { level: "Very Poor", class: "aqi-very-unhealthy" };
      default: return { level: "Unknown", class: "" };
  }
}

function displayAirQuality(data, city) {
  const location = document.getElementById("location").querySelector("span");
  const temperature = document.getElementById("temperature").querySelector("span");
  const feelsLike = document.getElementById("feels-like").querySelector("span");
  const rainProb = document.getElementById("rain-prob").querySelector("span");
  const airQuality = document.getElementById("air-quality").querySelector("span");
  const description = document.getElementById("description").querySelector("span");

  const aqi = data.list[0].main.aqi;
  const aqiInfo = getAQILevel(aqi);
  
  location.textContent = city;
  temperature.textContent = "N/A";
  feelsLike.textContent = "N/A";
  rainProb.textContent = "N/A";
  airQuality.innerHTML = `<span class="${aqiInfo.class}">${aqiInfo.level} (${aqi})</span>`;
  
  const components = data.list[0].components;
  description.textContent = `PM2.5: ${components.pm2_5} μg/m³, PM10: ${components.pm10} μg/m³, NO2: ${components.no2} μg/m³, O3: ${components.o3} μg/m³`;

  checkAirQualityAlert(aqi);
}

function checkAirQualityAlert(aqi) {
  if (aqi >= 4) {
      alert("Warning: Air quality is poor! Consider limiting outdoor activities.");
  } else if (aqi === 3) {
      alert("Moderate air quality. Sensitive individuals should take precautions.");
  }
}

function checkWeatherAlerts(data) {
  const temp = data.main.temp;
  const feelsLike = data.main.feels_like;
  const rainProbability = calculateRainProbability(data);
  
  if (temp > 30) {
      alert("Warning: Extreme heat detected! Stay hydrated and avoid outdoor activities.");
  } else if (temp < -5) {
      alert("Warning: Extreme cold detected! Dress warmly and take necessary precautions.");
  }

  if (Math.abs(temp - feelsLike) > 5) {
      if (feelsLike < temp) {
          alert(`Note: It feels ${Math.round(temp - feelsLike)}°C colder than the actual temperature due to weather conditions!`);
      } else {
          alert(`Note: It feels ${Math.round(feelsLike - temp)}°C warmer than the actual temperature due to weather conditions!`);
      }
  }

  if (rainProbability >= 80) {
      alert("High chance of rain! Don't forget your umbrella!");
  }
}

function displayCurrentWeather(data, option) {
  const location = document.getElementById("location").querySelector("span");
  const temperature = document.getElementById("temperature").querySelector("span");
  const feelsLike = document.getElementById("feels-like").querySelector("span");
  const rainProb = document.getElementById("rain-prob").querySelector("span");
  const airQuality = document.getElementById("air-quality").querySelector("span");
  const description = document.getElementById("description").querySelector("span");

  location.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${data.main.temp} °C`;
  feelsLike.textContent = `${data.main.feels_like} °C`;
  airQuality.textContent = "N/A";
  
  const rainProbability = calculateRainProbability(data);
  rainProb.textContent = `${rainProbability}%`;

  switch(option) {
    case "feels-like":
      description.textContent = `Feels like temperature is ${data.main.feels_like} °C`;
      break;
    case "rain-probability":
      description.textContent = `Rain Probability: ${rainProbability}%`;
      break;
    case "wind-speed":
      description.textContent = `Wind Speed: ${data.wind.speed} m/s`;
      break;
    case "humidity":
      description.textContent = `Humidity: ${data.main.humidity}%`;
      break;
    case "sunrise-sunset":
      const sunrise = convertUnixTimeToLocalTime(data.sys.sunrise, data.timezone);
      const sunset = convertUnixTimeToLocalTime(data.sys.sunset, data.timezone);
      description.textContent = `Sunrise: ${sunrise}, Sunset: ${sunset}`;
      break;
    default:
      description.textContent = data.weather[0].description;
  }
}

function calculateRainProbability(data) {
  const cloudCover = data.clouds.all;
  const humidity = data.main.humidity;
  return Math.min(Math.round((cloudCover + humidity) / 2), 100);
}

function convertUnixTimeToLocalTime(unixTime, timezoneOffset) {
  const date = new Date((unixTime + timezoneOffset) * 1000);
  return date.toUTCString().slice(-12, -7);
}

function displayForecast(data) {
  const forecastElements = [
      document.getElementById("day1"),
      document.getElementById("day2"),
      document.getElementById("day3"),
      document.getElementById("day4"),
      document.getElementById("day5"),
  ];

  forecastElements.forEach((element, i) => {
      const forecast = data.list[i * 8];
      const rainProb = forecast.pop ? forecast.pop * 100 : calculateRainProbability(forecast);
      
      if (rainProb >= 80) {
          alert(`High chance of rain (${Math.round(rainProb)}%) on day ${i + 1}! Plan accordingly!`);
      }
      
      element.textContent = `Day ${i + 1}: ${forecast.main.temp} °C (Feels like: ${forecast.main.feels_like} °C), Rain: ${Math.round(rainProb)}%, ${forecast.weather[0].description}`;
  });
}

function toggleVisibility(elementId, shouldShow) {
  document.getElementById(elementId).style.display = shouldShow ? "block" : "none";
}

function redirectToEventsPage() {
  setTimeout(() => {
      window.location.href = "evebri.html";
  }, 2000);
}
