// TypeScript type definitions for Google Maps JS API (minimal for Autocomplete)
declare global {
  namespace google.maps.places {
    class Autocomplete {
      constructor(input: HTMLInputElement, opts?: AutocompleteOptions);
      getPlace(): PlaceResult;
      addListener(event: string, handler: () => void): void;
    }
    interface AutocompleteOptions {
      types?: string[];
      componentRestrictions?: { country: string };
    }
    interface PlaceResult {
      formatted_address?: string;
      name?: string;
    }
  }
  interface Window {
    google: typeof google;
  }
}
export {};
