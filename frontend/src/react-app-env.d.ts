/// <reference types="react-scripts" />

interface Window {
  google?: {
    maps: {
      places: {
        Autocomplete: new (
          input: HTMLInputElement,
          opts?: Record<string, unknown>
        ) => {
          addListener: (event: string, handler: () => void) => void;
          getPlace: () => { formatted_address?: string; name?: string };
        };
      };
    };
  };
}
