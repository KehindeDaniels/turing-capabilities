// hooks/useWeatherData.js
import { useReducer, useCallback, useRef, useEffect } from "react";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

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

  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  const fetchWeatherData = useCallback(
    async (location) => {
      if (!location) return;

      // Check cache first
      const cachedData = cache.get(location);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        dispatch({ type: "FETCH_SUCCESS", payload: cachedData.data });
        return;
      }

      // Cancel previous request if exists
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
          throw new Error(getErrorMessage(response.status));
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
          payload: error.message || "An unexpected error occurred",
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

  return {
    ...state,
    fetchWeatherData,
    clearCache,
  };
};

const getErrorMessage = (status) => {
  switch (status) {
    case 401:
      return "Invalid API key. Please check your API configuration.";
    case 404:
      return "Location not found. Please check the city name.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
};
