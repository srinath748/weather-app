const apiKey = "4c37787c4d7f530631c93147f72dfbfb"; // Your OpenWeatherMap API key

const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const cityInput = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const forecastContainer = document.getElementById("forecastContainer");
const weatherSection = document.getElementById("weatherSection");
const forecastSection = document.getElementById("forecastSection");
const errorBox = document.getElementById("errorBox");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle"); // Add a button in HTML for this

let darkMode = false;
let metric = true; // Celsius by default

// Search by city
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  } else {
    showErrorMessage("Please enter a city name");
  }
});

// Get location
locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    showErrorMessage("Geolocation is not supported by this browser.");
  }
});

// Allow pressing Enter
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

function showLoader() {
  loader.style.display = "block";
}
function hideLoader() {
  loader.style.display = "none";
}

function showErrorMessage(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
  // Make it dismissible
  errorBox.onclick = () => errorBox.style.display = "none";
  setTimeout(() => errorBox.style.display = "none", 5000);
}

async function getWeatherByCity(city) {
  try {
    showLoader();
    forecastContainer.innerHTML = "";
    forecastSection.style.display = "none";
    const units = metric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    displayWeather(data);
    getForecast(city);

    // Save last city
    localStorage.setItem("lastCity", data.name);
  } catch (error) {
    showErrorMessage(error.message);
  } finally {
    hideLoader();
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    showLoader();
    forecastContainer.innerHTML = "";
    forecastSection.style.display = "none";
    const units = metric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to fetch weather");

    const data = await response.json();
    displayWeather(data);
    getForecastByCoords(lat, lon);
  } catch (error) {
    showErrorMessage(error.message);
  } finally {
    hideLoader();
  }
}

function displayWeather(data) {
  weatherSection.style.display = "block";
  weatherSection.classList.add("fade-in");

  document.getElementById("cityName").textContent = data.name;
  const unitSymbol = metric ? "°C" : "°F";
  document.getElementById("temperature").textContent = `Temperature: ${Math.round(data.main.temp)} ${unitSymbol}`;

  const desc = data.weather[0].description;
  document.getElementById("description").textContent = desc.charAt(0).toUpperCase() + desc.slice(1);

  document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").textContent = `Wind: ${Math.round(data.wind.speed)} ${metric ? "m/s" : "mph"}`;

  // Weather icon
  const iconCode = data.weather[0].icon;
  const weatherIcon = document.getElementById("weatherIcon");
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.style.display = "block";

  // Background gradient
  const condition = data.weather[0].main.toLowerCase();
  let bg;
  if (condition.includes("clear")) {
    bg = "linear-gradient(to right, #f9d423, #ff4e50)";
  } else if (condition.includes("cloud")) {
    bg = "linear-gradient(to right, #757f9a, #d7dde8)";
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    bg = "linear-gradient(to right, #00c6ff, #0072ff)";
  } else if (condition.includes("thunderstorm")) {
    bg = "linear-gradient(to right, #141e30, #243b55)";
  } else if (condition.includes("snow")) {
    bg = "linear-gradient(to right, #83a4d4, #b6fbff)";
  } else {
    bg = "linear-gradient(to right, #bdc3c7, #2c3e50)";
  }
  document.body.style.background = bg;
}

async function getForecast(city) {
  try {
    const units = metric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not available");

    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error(error);
  }
}

async function getForecastByCoords(lat, lon) {
  try {
    const units = metric ? "metric" : "imperial";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not available");

    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error(error);
  }
}

function displayForecast(data) {
  forecastSection.style.display = "block";
  forecastSection.classList.add("fade-in");
  forecastContainer.innerHTML = "";

  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.forEach((day, index) => {
    const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
    const temp = Math.round(day.main.temp);
    const icon = day.weather[0].icon;
    const desc = day.weather[0].main.toLowerCase();

    let bgStyle;
    if (desc.includes("clear")) {
      bgStyle = "linear-gradient(135deg, #f9d423, #ff4e50)";
    } else if (desc.includes("cloud")) {
      bgStyle = "linear-gradient(135deg, #757f9a, #d7dde8)";
    } else if (desc.includes("rain") || desc.includes("drizzle")) {
      bgStyle = "linear-gradient(135deg, #00c6ff, #0072ff)";
    } else if (desc.includes("thunderstorm")) {
      bgStyle = "linear-gradient(135deg, #141e30, #243b55)";
    } else if (desc.includes("snow")) {
      bgStyle = "linear-gradient(135deg, #83a4d4, #b6fbff)";
    } else {
      bgStyle = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
    }

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    setTimeout(() => card.classList.add("show"), index * 150);
    card.style.background = bgStyle;

    const unitSymbol = metric ? "°C" : "°F";

    card.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
      <p>${temp}${unitSymbol}</p>
      <small>${day.weather[0].main}</small>
    `;

    forecastContainer.appendChild(card);
  });
}

function showPosition(position) {
  getWeatherByCoords(position.coords.latitude, position.coords.longitude);
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      showErrorMessage("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      showErrorMessage("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      showErrorMessage("The request to get user location timed out.");
      break;
    default:
      showErrorMessage("An unknown error occurred.");
      break;
  }
}

// 🌙 Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkMode = !darkMode;
  themeToggle.innerHTML = darkMode
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  themeToggle.setAttribute("title", darkMode ? "Light Mode" : "Dark Mode");
});

// 🌡️ Unit Toggle (Celsius <-> Fahrenheit)
unitToggle.addEventListener("click", () => {
  metric = !metric;
  const currentCity = document.getElementById("cityName").textContent;
  if (currentCity) getWeatherByCity(currentCity);
  unitToggle.textContent = metric ? "Switch to °F" : "Switch to °C";
});

// 🔄 Load last searched city on page load
window.addEventListener("load", () => {
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) getWeatherByCity(lastCity);
});
