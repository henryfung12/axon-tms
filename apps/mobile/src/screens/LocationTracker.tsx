import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

const TRACKING_INTERVAL = 30000;

export function useLocationTracker(isActive: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { isAuthenticated, accessToken } = useAuthStore();

  const sendLocation = async () => {
    try {
      console.log('Sending location... token:', accessToken ? 'present' : 'missing');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('Got location:', location.coords.latitude, location.coords.longitude);

      const response = await api.post('/drivers/location', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        speed: location.coords.speed || 0,
      });

      console.log('Location sent successfully:', response.status);
    } catch (error: any) {
      console.log('Location update failed:', error?.response?.status, error?.message);
    }
  };

  useEffect(() => {
    if (!isActive || !isAuthenticated) {
      console.log('Tracker not active. isActive:', isActive, 'isAuthenticated:', isAuthenticated);
      return;
    }

    const startTracking = async () => {
      console.log('Starting location tracking...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);

      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      await sendLocation();
      intervalRef.current = setInterval(sendLocation, TRACKING_INTERVAL);
    };

    startTracking();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isAuthenticated]);
}