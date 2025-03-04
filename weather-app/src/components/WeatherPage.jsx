/* src/pages/WeatherPage.jsx */
import  { lazy, Suspense } from "react";
// Lazy-load the WeatherDetails component
const WeatherDetails = lazy(() => import("../components/WeatherDetails"));

import useWeather from "../hooks/useWeather";

// Replace this with your real API key
const API_KEY = "ac87ffc7968820e84cd66dd4f1cfa912";

function WeatherPage() {
  // Use our custom hook
  const {
    data: weather,
    loading,
    error,
    fallback,
    setLocation,
    refresh,
  } = useWeather("", API_KEY);

  const handleInputChange = (e) => {
    setLocation(e.target.value);
  };

  // If multiple errors have occurred or the API is unreachable,
  // show a more user-friendly fallback UI:
  if (fallback) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">CNForcast News @10</h1>
        <p className="text-red-500">
          We are having trouble reaching the weather service. Please try again
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">CNForcast News @10</h1>
      <input
        className="border p-2 mb-4"
        type="text"
        placeholder="Enter location"
        onChange={handleInputChange}
      />
      <button
        onClick={refresh}
        className="bg-blue-500 text-white p-2 mb-4 ml-2"
      >
        Refresh
      </button>

      {/* Loading Indicator */}
      {loading && <p>Loading...</p>}

      {/* Single error message */}
      {error && !loading && <p className="text-red-500">Error: {error}</p>}

      {/* Weather Information (Lazy Loaded Component) */}
      {!loading && !error && weather && (
        <Suspense fallback={<p>Loading weather details...</p>}>
          <WeatherDetails weather={weather} />
        </Suspense>
      )}
    </div>
  );
}

export default WeatherPage;