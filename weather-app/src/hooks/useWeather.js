// hooks/useWeather.js
import { useReducer, useCallback, useRef, useEffect } from "react";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

const initialState = {
  weatherData: null,
  loading: false,
  error: null,
  cache: new Map(),
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
        cache: new Map(state.cache).set(action.location, {
          data: action.payload,
          timestamp: Date.now(),
        }),
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const useWeather = (initialLocation = "") => {
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  const abortControllerRef = useRef(null);

  const fetchWeather = useCallback(async (location) => {
    if (!location) return;

    // Check cache
    const cachedData = state.cache.get(location);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      dispatch({ type: "FETCH_SUCCESS", payload: cachedData.data, location });
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      dispatch({ type: "FETCH_START" });

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=ac87ffc7968820e84cd66dd4f1cfa912&units=metric`,
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
      dispatch({ type: "FETCH_SUCCESS", payload: data, location });
    } catch (error) {
      if (error.name === "AbortError") return;

      dispatch({
        type: "FETCH_ERROR",
        payload: error.message || "Failed to fetch weather data",
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    fetchWeather,
  };
};
