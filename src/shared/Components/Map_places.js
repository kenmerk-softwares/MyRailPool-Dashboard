import React from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../services/firebase';

const libraries = ['places'];

const MapPlaces = ({ children, onLoad, onPlaceChanged }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (!isLoaded) {
    return (
      <div className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-medium animate-pulse text-sm">
        Synchronizing Map Data...
      </div>
    );
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      {children}
    </Autocomplete>
  );
};

export default MapPlaces;
