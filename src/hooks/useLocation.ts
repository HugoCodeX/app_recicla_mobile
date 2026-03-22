import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';

export function useLocation(enabled: boolean = true) {
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadLocation = async () => {
        if (!enabled) return;
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            if (isActive) {
              setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
            }
          }
        } catch (error) {
          console.error("Error obteniendo ubicación:", error);
        }
      };
      
      loadLocation();
      return () => { isActive = false; };
    }, [enabled])
  );

  return { userLocation, setUserLocation };
}
