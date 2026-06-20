/* ==========================================
   OPEN WEATHER CONFIG
========================================== */

const API_KEY = "feda1094d4653706407e956d40308552";

const CURRENT_WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/forecast";

/* ==========================================
   DOM ELEMENTS
========================================== */

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const recentCities = document.getElementById("recentCities");

const weatherCard = document.getElementById("weatherCard");
const forecastContainer =
  document.getElementById("forecastContainer");

const forecastHeading =
  document.getElementById("forecastHeading");

const cityName =
  document.getElementById("cityName");

const currentDate =
  document.getElementById("currentDate");

const temperature =
  document.getElementById("temperature");

const humidity =
  document.getElementById("humidity");

const wind =
  document.getElementById("wind");

const condition =
  document.getElementById("condition");

const weatherDescription =
  document.getElementById("weatherDescription");

const weatherIcon =
  document.getElementById("weatherIcon");

const errorBox =
  document.getElementById("errorBox");

const alertBox =
  document.getElementById("alertBox");

const loader =
  document.getElementById("loader");

const backgroundOverlay =
  document.getElementById("backgroundOverlay");

const celsiusBtn =
  document.getElementById("celsiusBtn");

const fahrenheitBtn =
  document.getElementById("fahrenheitBtn");

/* ==========================================
   GLOBAL VARIABLES
========================================== */

let currentTempC = 0;

/* ==========================================
   SHOW LOADER
========================================== */

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

/* ==========================================
   ERROR TOAST
========================================== */

function showError(message) {
  errorBox.textContent = message;

  errorBox.classList.remove("hidden");

  setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 3000);
}

/* ==========================================
   ALERT TOAST
========================================== */

function showAlert(message) {
  alertBox.textContent = message;

  alertBox.classList.remove("hidden");

  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 4000);
}

/* ==========================================
   DATE FORMAT
========================================== */

function getFormattedDate() {
  const today = new Date();

  return today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/* ==========================================
   WEATHER BACKGROUND
========================================== */

function updateBackground(weatherType) {

  backgroundOverlay.className = "";

  switch (weatherType.toLowerCase()) {

    case "clear":
      backgroundOverlay.classList.add("clear-bg");
      break;

    case "clouds":
      backgroundOverlay.classList.add("cloud-bg");
      break;

    case "rain":
    case "drizzle":
      backgroundOverlay.classList.add("rain-bg");
      break;

    case "snow":
      backgroundOverlay.classList.add("snow-bg");
      break;

    case "thunderstorm":
      backgroundOverlay.classList.add("thunder-bg");
      break;

    default:
      backgroundOverlay.classList.add("clear-bg");
  }
}

/* ==========================================
   FETCH CURRENT WEATHER
========================================== */

async function getCurrentWeather(city) {

  const response = await fetch(
    `${CURRENT_WEATHER_URL}?q=${city}&appid=${API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error("City not found");
  }

  return response.json();
}


/* ==========================================
   FETCH FORECAST
========================================== */

async function getForecast(city) {

  const response = await fetch(
    `${FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error("Forecast unavailable");
  }

  return response.json();
}


/* ==========================================
   DISPLAY CURRENT WEATHER
========================================== */

function displayWeather(data) {

  weatherCard.classList.remove("hidden");

  cityName.textContent = data.name;

  currentDate.textContent =
    getFormattedDate();

  currentTempC = data.main.temp;

  temperature.textContent =
    `${data.main.temp} °C`;

  humidity.textContent =
    `${data.main.humidity}%`;

  wind.textContent =
    `${data.wind.speed} m/s`;

  condition.textContent =
    data.weather[0].main;

  weatherDescription.textContent =
    data.weather[0].description;

  weatherIcon.src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  updateBackground(
    data.weather[0].main
  );

  if (data.main.temp > 40) {
    showAlert(
      "🔥 Extreme Heat Alert! Temperature above 40°C"
    );
  }
}



/* ==========================================
   DISPLAY FORECAST
========================================== */

function displayForecast(data) {

  forecastContainer.innerHTML = "";

  forecastHeading.classList.remove("hidden");

  const forecastList =
    data.list.filter(item =>
      item.dt_txt.includes("12:00:00")
    );

  forecastList.forEach(day => {

    const date =
      new Date(day.dt_txt)
      .toLocaleDateString();

    const icon =
      `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

    const card = `
      <div class="forecast-card">

        <p class="forecast-date">
          ${date}
        </p>

        <img
          src="${icon}"
          class="forecast-icon"
          alt="weather">

        <p class="forecast-temp">
          🌡 ${day.main.temp}°C
        </p>

        <p class="forecast-detail">
          💧 ${day.main.humidity}%
        </p>

        <p class="forecast-detail">
          💨 ${day.wind.speed} m/s
        </p>

      </div>
    `;

    forecastContainer.innerHTML += card;
  });
}

/* ==========================================
   LOCAL STORAGE
========================================== */

function saveRecentCity(city) {

  let cities =
    JSON.parse(
      localStorage.getItem("recentCities")
    ) || [];

  cities = cities.filter(
    item => item !== city
  );

  cities.unshift(city);

  cities = cities.slice(0, 5);

  localStorage.setItem(
    "recentCities",
    JSON.stringify(cities)
  );

  loadRecentCities();
}

function loadRecentCities() {

  const cities =
    JSON.parse(
      localStorage.getItem("recentCities")
    ) || [];

  recentCities.innerHTML =
    `<option value="">Select Recent City</option>`;

  cities.forEach(city => {

    const option =
      document.createElement("option");

    option.value = city;

    option.textContent = city;

    recentCities.appendChild(option);
  });
}

/* ==========================================
   LOAD WEATHER
========================================== */

async function loadWeather(city) {

  try {

    showLoader();

    const weather =
      await getCurrentWeather(city);

    const forecast =
      await getForecast(city);

    displayWeather(weather);

    displayForecast(forecast);

    saveRecentCity(city);

  } catch (error) {

    showError(error.message);

  } finally {

    hideLoader();
  }
}

/* ==========================================
   SEARCH CITY
========================================== */

searchBtn.addEventListener("click", () => {

  const city =
    cityInput.value.trim();

  if (!city) {

    showError(
      "Please enter a city name"
    );

    return;
  }

  loadWeather(city);
});

/* ==========================================
   ENTER KEY SEARCH
========================================== */

cityInput.addEventListener("keypress",
  function (event) {

    if (event.key === "Enter") {

      searchBtn.click();
    }
});

/* ==========================================
   RECENT CITY SELECT
========================================== */

recentCities.addEventListener(
  "change",
  (event) => {

    const city =
      event.target.value;

    if (city) {

      loadWeather(city);
    }
});

/* ==========================================
   CURRENT LOCATION
========================================== */

locationBtn.addEventListener(
  "click",
  () => {

    if (!navigator.geolocation) {

      showError(
        "Geolocation not supported"
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      fetchLocationWeather,
      () => {

        showError(
          "Unable to access location"
        );
      }
    );
  }
);

async function fetchLocationWeather(position) {
  try {
    showLoader();

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const weatherResponse = await fetch(
      `${CURRENT_WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const weatherData = await weatherResponse.json();

    const forecastResponse = await fetch(
      `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const forecastData = await forecastResponse.json();

    displayWeather(weatherData);
    displayForecast(forecastData);

  } catch (error) {
    showError("Unable to fetch location weather");
  } finally {
    hideLoader();
  }
}

/* ==========================================
   TEMPERATURE TOGGLE
========================================== */

celsiusBtn.addEventListener(
  "click",
  () => {

    temperature.textContent =
      `${currentTempC.toFixed(1)} °C`;
  }
);

fahrenheitBtn.addEventListener(
  "click",
  () => {

    const fahrenheit =
      (currentTempC * 9 / 5) + 32;

    temperature.textContent =
      `${fahrenheit.toFixed(1)} °F`;
  }
);

/* ==========================================
   INITIALIZE
========================================== */

loadRecentCities();