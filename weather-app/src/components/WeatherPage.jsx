// components/WeatherPage.jsx
import React, { useState, useCallback, lazy, Suspense } from "react";
import { debounce } from "lodash";
import { useWeather } from "../hooks/useWeather";
import WeatherFallback from "./WeatherFallback";

// Lazy load the weather details component
const WeatherDetails = lazy(() => import("./WeatherDetails"));

function WeatherPage() {
  const [location, setLocation] = useState("");
  const { weatherData, loading, error, fetchWeather } = useWeather();

  // Debounce the fetch weather function
  const debouncedFetchWeather = useCallback(
    debounce((loc) => fetchWeather(loc), 500),
    [fetchWeather]
  );

  const handleLocationChange = useCallback(
    (e) => {
      const newLocation = e.target.value;
      setLocation(newLocation);
      if (newLocation.trim()) {
        debouncedFetchWeather(newLocation);
      }
    },
    [debouncedFetchWeather]
  );

  const handleRefresh = useCallback(() => {
    if (location.trim()) {
      fetchWeather(location);
    }
  }, [location, fetchWeather]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        CN'Forcast Weather
      </h1>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={handleLocationChange}
        />
        <button
          onClick={handleRefresh}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && (
        <div className="text-center p-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}

      {error && <WeatherFallback error={error} onRetry={handleRefresh} />}

      {weatherData && !loading && !error && (
        <Suspense fallback={<div>Loading weather details...</div>}>
          <WeatherDetails data={weatherData} />
        </Suspense>
      )}
    </div>
  );
}

export default WeatherPage;
