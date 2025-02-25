// components/FallbackUI.jsx
const FallbackUI = ({ error, onRetry }) => (
  <div className="text-center p-4 bg-red-50 rounded-lg">
    <h3 className="text-xl font-semibold text-red-700 mb-2">
      Oops! Something went wrong
    </h3>
    <p className="text-red-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
    >
      Try Again
    </button>
  </div>
);

export default FallbackUI;
