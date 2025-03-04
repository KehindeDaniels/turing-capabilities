/* src/hooks/useWeather.js */
import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";

/**
 * Simple in-memory cache for weather data (keyed by location).
 * You could replace this with a more advanced caching strategy,
 * e.g. localStorage, indexedDB, etc.
 */
const weatherCache = new Map();

/**
 * Debounce function to avoid rapid calls (e.g. as the user types).
 * You could also implement this via a separate custom hook, but
 * included inline here for brevity.
 */
function debounce(func, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// Action types for our reducer
const FETCH_INIT = "FETCH_INIT";
const FETCH_SUCCESS = "FETCH_SUCCESS";
const FETCH_FAILURE = "FETCH_FAILURE";
const FETCH_FALLBACK = "FETCH_FALLBACK"; // for multiple errors / fallback UI

// Weather data reducer
function weatherReducer(state, action) {
  switch (action.type) {
    case FETCH_INIT:
      return {
        ...state,
        loading: true,
        error: null,
        fallback: false,
      };
    case FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload,
      };
    case FETCH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case FETCH_FALLBACK:
      return {
        ...state,
        loading: false,
        error: null,
        fallback: true,
      };
    default:
      return state;
  }
}

/**
 * useWeather hook
 *
 * Encapsulates:
 * - Debounced location changes
 * - Caching logic
 * - Error handling (including multiple retries -> fallback)
 * - Abort signals to cancel in-flight requests
 */
export default function useWeather(initialLocation = "", apiKey) {
  const [state, dispatch] = useReducer(weatherReducer, {
    data: null,
    loading: false,
    error: null,
    fallback: false,
  });

  // Keep track of how many times we consecutively fail to fetch
  const failureCountRef = useRef(0);

  // AbortController reference to cancel ongoing fetch if location changes
  const abortControllerRef = useRef(null);

  // We will store the current location in local state to handle
  // debouncing, then fetch once the user finished typing or after a short delay
  const locationRef = useRef(initialLocation);

  // Memoize the core fetch function to avoid re-creating it unnecessarily
  const fetchWeatherData = useCallback(
    async (loc) => {
      if (!loc) {
        dispatch({ type: FETCH_FAILURE, payload: "Please enter a location." });
        return;
      }

      // Check cache first
      if (weatherCache.has(loc)) {
        dispatch({ type: FETCH_SUCCESS, payload: weatherCache.get(loc) });
        return;
      }

      // Abort existing request if present, then create a new signal
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      dispatch({ type: FETCH_INIT });

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            loc
          )}&appid=${apiKey}`,
          { signal }
        );

        // Simulate various HTTP error handling
        if (!response.ok) {
          // Could handle specific status codes differently
          if ([401, 404, 429, 500].includes(response.status)) {
            throw new Error(`HTTP Error ${response.status}`);
          }
          throw new Error(`Unexpected HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        // Cache the result
        weatherCache.set(loc, data);

        // Reset failure count on success
        failureCountRef.current = 0;
        dispatch({ type: FETCH_SUCCESS, payload: data });
      } catch (error) {
        // If the fetch was aborted, we can silently ignore or handle if needed
        if (signal.aborted) return;

        failureCountRef.current += 1;
        // If multiple failures, show fallback
        if (failureCountRef.current > 2) {
          dispatch({ type: FETCH_FALLBACK });
        } else {
          dispatch({ type: FETCH_FAILURE, payload: error.message });
        }
      }
    },
    [apiKey]
  );

  // Debounce the fetch call so it doesn't happen on every keystroke
  const debouncedFetch = useMemo(
    () => debounce(fetchWeatherData, 500),
    [fetchWeatherData]
  );

  // Allows parent component to request a refresh
  const refresh = useCallback(() => {
    const loc = locationRef.current;
    failureCountRef.current = 0;
    debouncedFetch(loc);
  }, [debouncedFetch]);

  // Expose setter for the location to the parent. We store in a ref so that
  // we can control when the actual fetch fires (debounced).
  const setLocation = useCallback(
    (newLoc) => {
      locationRef.current = newLoc;
      debouncedFetch(newLoc);
    },
    [debouncedFetch]
  );

  // Fetch data on initial mount if initialLocation is provided
  useEffect(() => {
    if (initialLocation) {
      debouncedFetch(initialLocation);
    }
    // Cleanup on unmount: abort any in-progress fetch
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // We only want to run this once on mount, so we skip listing dependencies
    // for the effect that triggers the initial fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    setLocation,
    refresh,
  };
}
