document
  .getElementById("weather-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const city = document.getElementById("city").value;
    const weatherOption = document.getElementById("weather-option").value;

    // Show loading message
    document.getElementById("loading").style.display = "block";
    document.getElementById("weather-data").style.display = "none";
    document.getElementById("forecast").style.display = "none";
    document.getElementById("error-message").style.display = "none";

    const apiKey = "5587c509f668933659fdd7a834900c45"; // Replace with your actual API key
    let url;

    if (
      weatherOption === "current" ||
      weatherOption === "wind-speed" ||
      weatherOption === "humidity" ||
      weatherOption === "sunrise-sunset"
    ) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    } else if (weatherOption === "forecast") {
      url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        document.getElementById("loading").style.display = "none";

        if (
          weatherOption === "current" ||
          weatherOption === "wind-speed" ||
          weatherOption === "humidity" ||
          weatherOption === "sunrise-sunset"
        ) {
          displayCurrentWeather(data, weatherOption);
          document.getElementById("weather-data").style.display = "block";
        } else if (weatherOption === "forecast") {
          displayForecast(data);
          document.getElementById("forecast").style.display = "block";

          // Redirect to the events page after displaying forecast data
          setTimeout(() => {
            window.location.href = "evebri.html"; // Replace 'evebri.html' with the actual path to the events page
          }, 2000); // Delay for 2 seconds before redirection
        }
      })
      .catch((error) => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("error-message").style.display = "block";
        console.error("There was a problem with the fetch operation:", error);
      });
  });

function displayCurrentWeather(data, option) {
  const location = document.getElementById("location").querySelector("span");
  const temperature = document
    .getElementById("temperature")
    .querySelector("span");
  const description = document
    .getElementById("description")
    .querySelector("span");

  location.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = `${data.main.temp} °C`;

  if (option === "wind-speed") {
    description.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  } else if (option === "humidity") {
    description.textContent = `Humidity: ${data.main.humidity}%`;
  } else if (option === "sunrise-sunset") {
    // Convert sunrise and sunset times to local time using the timezone offset
    const timezoneOffset = data.timezone; // Offset in seconds from UTC
    console.log(data.sys.sunrise)
    console.log(data.sys.sunset)
    console.log(data)
    const sunrise = new Date(data.sys.sunrise*1000 + timezoneOffset*1000).toUTCString("en-US", { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(data.sys.sunset*1000 + timezoneOffset*1000).toUTCString("en-US", { hour: "2-digit", minute: "2-digit" });
  


    /*const sunrise = new Date(
      (data.sys.sunrise ) * 1000
    ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(
      (data.sys.sunset ) * 1000
    ).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
   */
  
   description.textContent = `Sunrise: ${sunrise}, Sunset: ${sunset}`;
  } else {
    description.textContent = `${data.weather[0].description}`;
  }
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  const days = [1, 2, 3, 4, 5];

  // Clear previous forecast data if any
  days.forEach((day) => {
    document.getElementById(`day${day}`).textContent = "";
  });

  // OpenWeather API returns forecast in 3-hour intervals; we’ll extract daily forecast at noon
  const dailyForecast = data.list.filter((entry) =>
    entry.dt_txt.includes("12:00:00")
  );

  dailyForecast.slice(0, 5).forEach((forecast, index) => {
    const date = new Date(forecast.dt * 1000).toLocaleDateString();
    const temp = forecast.main.temp;
    const description = forecast.weather[0].description;

    document.getElementById(
      `day${index + 1}`
    ).textContent = `Date: ${date}, Temp: ${temp} °C, ${description}`;
  });
}
