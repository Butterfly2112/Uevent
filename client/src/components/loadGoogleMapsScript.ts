// Loads Google Maps JS API script if not already loaded
export function loadGoogleMapsScript(apiKey: string, language = 'uk') {
  if (typeof window === 'undefined') return;
  if (window.google && window.google.maps && window.google.maps.places) return;
  const scriptId = 'google-maps-script';
  if (document.getElementById(scriptId)) return;
  const script = document.createElement('script');
  script.id = scriptId;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}`;
  script.async = true;
  document.body.appendChild(script);
}
