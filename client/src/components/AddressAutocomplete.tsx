import React, { useRef, useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const AddressAutocomplete: React.FC<Props> = ({ value, onChange }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ['places'],
  });

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        setInputValue(place.formatted_address);
        onChange(place.formatted_address);
      }
    }
  };

  if (!isLoaded) {
    return <input type="text" value={inputValue} disabled placeholder="Loading..." style={{ width: '100%', marginBottom: 8, padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }} />;
  }

  return (
    <Autocomplete
      onLoad={ac => (autocompleteRef.current = ac)}
      onPlaceChanged={handlePlaceChanged}
    >
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        placeholder="Enter address"
        style={{ width: '100%', marginBottom: 8, padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 17 }}
      />
    </Autocomplete>
  );
};
