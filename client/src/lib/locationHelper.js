const PRECISION = 2 // ~1.1km fuzzy radius

function fuzzy(value) {
  return Math.round(value * Math.pow(10, PRECISION)) / Math.pow(10, PRECISION)
}

export function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: fuzzy(pos.coords.latitude),
          lng: fuzzy(pos.coords.longitude)
        })
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  })
}
