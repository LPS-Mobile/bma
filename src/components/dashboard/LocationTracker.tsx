'use client';

import { useEffect } from 'react';
import { updateUserLocation } from '@/app/actions/user';

export default function LocationTracker() {
  useEffect(() => {
    const captureLocation = async () => {
      // Check if we already captured it this session to avoid spamming
      if (sessionStorage.getItem('loc_captured')) return;

      try {
        // Free IP Geolocation API
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        if (data.city && data.country_name) {
          await updateUserLocation(data.city, data.country_name);
          sessionStorage.setItem('loc_captured', 'true');
          console.log('📍 Location captured:', data.city);
        }
      } catch (error) {
        // Fail silently (don't annoy the user)
      }
    };

    captureLocation();
  }, []);

  return null; // This component is invisible
}