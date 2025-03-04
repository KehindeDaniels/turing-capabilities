// components/WeatherFallback.jsx
export const WeatherFallback = ({ onRetry }) => (
  <div className="text-center p-4 bg-gray-100 rounded-lg">
    <h3 className="text-xl font-semibold mb-2">Unable to Load Weather Data</h3>
    <p className="mb-4">
      We're having trouble connecting to our weather service.
    </p>
    <button
      onClick={onRetry}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Try Again
    </button>
  </div>
);
