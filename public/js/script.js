const socket = io();
const marker = {};

// Map setup
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap contributors"
}).addTo(map);

// Start tracking function
function startTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.watchPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            socket.emit("send-location", { latitude, longitude });
            socket.emit("locationUpdate", { latitude, longitude });

            document.getElementById("lat").textContent = latitude.toFixed(5);
            document.getElementById("lng").textContent = longitude.toFixed(5);
            document.getElementById("lastUpdate").textContent = new Date().toLocaleTimeString();
        },
        (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to access location. Please enable it in browser settings.");
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        }
    );
}

// Check for permissions and auto-start tracking
if (navigator.permissions) {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
            startTracking();
        } else {
            // Optional: Show a UI to ask user to click a button
            alert("Please allow location permission in your browser settings.");
        }
    });
} else {
    // Older browsers fallback
    startTracking();
}

// Socket events
socket.on("connect", () => {
    document.getElementById("status").textContent = "🟢 Connected";
});

socket.on("disconnect", () => {
    document.getElementById("status").textContent = "🔴 Disconnected";
});

socket.on("recieve-location", (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude]);

    if (marker[id]) {
        marker[id].setLatLng([latitude, longitude]);
    } else {
        marker[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    if (marker[id]) {
        map.removeLayer(marker[id]);
        delete marker[id];
    }
});
