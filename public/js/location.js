const FALLBACK_POSITION = {
  latitude: 37.5656,
  longitude: 127.0086,
  fallback: true
};

export function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(FALLBACK_POSITION);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          fallback: false
        });
      },
      () => {
        resolve(FALLBACK_POSITION);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}