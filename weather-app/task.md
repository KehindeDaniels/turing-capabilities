

 So, I am building a weather forecast application for a company called CN'Forcast. I currently have a WeatherPage component built using Vite and Tailwind CSS, but I need you to help me edit it as it needs refactoring due to the redundancy, inconsistent naming disorganized code
 Things to note
- It fetches data from the OpenWeather API

Help me refactor this code and the final solution should
- Use async/await with proper error handling for network errors, HTTP errors 404, 401, invalid API, and unexpected response errors
- Display a user freiendly message for each of the errors, so that users can know what is happening
- Use a single useEffect hook with a proper dependency array to manage lifecycle events for component mount and location changes
- Please consolidate state management to remove redundancy and
- Optimize and memoize functions where it is needed

Note: my api key: `ac87ffc7968820e84cd66dd4f1cfa912`

```javascript
import React, { useState, useEffect } from 'react';

function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [loc, setLoc] = useState("New York");
  const [loading, setLoading] = useState(false);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeatherData = () => {
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + loc + "&appid=API_KEY")
      .then(response => response.json())
      .then(data => {
        setWeather(data);
        setWeatherInfo(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Error: " + err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchWeatherData(); 
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchWeatherData(); 
  }, [loc]);

  function refreshWeather() {
    setLoading(true);
    fetchWeatherData();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CN'Forcast News @10</h1>
      <input
        className="border p-2 mb-4"
        type="text"
        placeholder="Enter location"
        value={loc}
        onChange={(e) => setLoc(e.target.value)}
      />
      <button onClick={refreshWeather} className="bg-blue-500 text-white p-2 mb-4">
        Refresh
      </button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {weather && !loading && !error && (
        <div>
          <p>Temperature: {weather.main && weather.main.temp}</p>
          <p>Condition: {weather.weather && weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

export default WeatherPage;
```
