// components/WeatherDetails.jsx
import React, { memo } from "react";

const WeatherDetails = memo(({ data }) => {
  const temperature = Math.round(data.main.temp);
  const description = data.weather[0].description;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Weather in {data.name}, {data.sys.country}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-700">{temperature}°C</p>
          <p className="text-gray-600">Temperature</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-xl capitalize">{description}</p>
          <p className="text-gray-600">Condition</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-xl">{data.main.humidity}%</p>
          <p className="text-gray-600">Humidity</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-xl">{data.wind.speed} m/s</p>
          <p className="text-gray-600">Wind Speed</p>
        </div>
      </div>
    </div>
  );
});

WeatherDetails.displayName = "WeatherDetails";

export default WeatherDetails;
