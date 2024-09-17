const socket = io({
  transports: ["websocket", "polling"], // Force WebSocket
  upgrade: false, // Prevent upgrading to polling
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    // watchposition takes 3 things, git the cordinates first and sent it to the backend.
    // if u get error, log it
    // gave it some configurations.settings
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.error("User denied the request for Geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.error("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          console.error("The request to get user location timed out.");
          break;
        default:
          console.error("An unknown error occurred.");
          break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0, //do not take saved/cached data, get live rather
    }
  );
}
const map = L.map("map").setView([0, 0], 16); // to ask location
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "ZUHAYR DANISH BEG",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
