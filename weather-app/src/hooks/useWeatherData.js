// hooks/useWeatherData.js
import { useReducer, useCallback, useRef, useEffect } from "react";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const initialState = {
  weatherData: null,
  loading: false,
  error: null,
};

const weatherReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        weatherData: action.payload,
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const cache = new Map();

export const useWeatherData = (apiKey) => {
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  const abortControllerRef = useRef(null);

  const getCachedData = (location) => {
    const cachedResult = cache.get(location);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return cachedResult.data;
    }
    return null;
  };

  const fetchWeatherData = useCallback(
    async (location) => {
      if (!location.trim()) return;

      // Check cache first
      const cachedData = getCachedData(location);
      if (cachedData) {
        dispatch({ type: "FETCH_SUCCESS", payload: cachedData });
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      dispatch({ type: "FETCH_START" });

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`,
          { signal: abortControllerRef.current.signal }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Location not found"
              : response.status === 401
              ? "Invalid API key"
              : response.status === 429
              ? "Too many requests"
              : response.status === 500
              ? "Server error"
              : "Failed to fetch weather data"
          );
        }

        const data = await response.json();

        // Cache the result
        cache.set(location, {
          data,
          timestamp: Date.now(),
        });

        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (error) {
        if (error.name === "AbortError") return;

        dispatch({
          type: "FETCH_ERROR",
          payload: error.message || "Failed to fetch weather data",
        });
      }
    },
    [apiKey]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { ...state, fetchWeatherData };
};
