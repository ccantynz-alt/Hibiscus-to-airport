import { useState, useEffect } from 'react';

/**
 * Load the Google Maps JavaScript API via a plain <script> tag.
 * Returns { isLoaded, loadError }.
 *
 * This replaces @react-google-maps/api's useLoadScript which can
 * conflict with Radix UI portals. Loading via <script> gives us
 * full control — Google's Autocomplete dropdown renders in the
 * real DOM, completely outside React.
 */
let _loadPromise = null;
let _loaded = false;
let _error = null;

function loadGoogleMaps(apiKey) {
  if (_loadPromise) return _loadPromise;
  if (window.google?.maps?.places) {
    _loaded = true;
    return Promise.resolve();
  }

  _loadPromise = new Promise((resolve, reject) => {
    if (!apiKey) {
      _error = new Error('No Google Maps API key');
      reject(_error);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      _loaded = true;
      resolve();
    };
    script.onerror = () => {
      _error = new Error('Failed to load Google Maps');
      reject(_error);
    };
    document.head.appendChild(script);
  });

  return _loadPromise;
}

export function useGoogleMaps(apiKey) {
  const [isLoaded, setIsLoaded] = useState(_loaded);
  const [loadError, setLoadError] = useState(_error);

  useEffect(() => {
    if (_loaded) {
      setIsLoaded(true);
      return;
    }
    if (!apiKey) {
      setLoadError(new Error('No API key'));
      return;
    }

    loadGoogleMaps(apiKey)
      .then(() => setIsLoaded(true))
      .catch((err) => setLoadError(err));
  }, [apiKey]);

  return { isLoaded, loadError };
}

/**
 * Attach Google Places Autocomplete to an input ref.
 * Call this after isLoaded is true.
 */
export function attachAutocomplete(inputRef, acRef, onPlaceChanged) {
  if (!inputRef.current || acRef.current) return;
  if (!window.google?.maps?.places) return;

  const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
    componentRestrictions: { country: 'nz' },
    fields: ['formatted_address', 'name'],
  });

  acRef.current = ac;

  ac.addListener('place_changed', () => {
    const place = ac.getPlace();
    const address = place.formatted_address || place.name || '';
    if (inputRef.current) inputRef.current.value = address;
    onPlaceChanged(address);
  });

  return ac;
}
