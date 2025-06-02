const socket = io();
const marker = {};
let watchId = null; // Used to stop tracking later

// Map setup
const map = L.map("map").setView([0, 0], 14);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "By Nitin"
}).addTo(map);

// Start location tracking
function startTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    watchId = navigator.geolocation.watchPosition(
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
            alert("Unable to access location.");
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 7000,
        }
    );

    // Update UI
    document.getElementById("startBtn").disabled = true;
    document.getElementById("stopBtn").disabled = false;
}

// Stop location tracking
function stopTracking() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        
    }
        if (marker[id]) {
        map.removeLayer(marker[id]);
        delete marker[id];
    }
        // You can optionally emit "user-disconnected" or just rely on socket disconnect
        socket.emit("user-disconnected", socket.id);
    }

    // Update UI
    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;
}

// Socket events
socket.on("connect", () => {
    document.getElementById("status").textContent = "🟢 Connected";
});

socket.on("disconnect", () => {
    document.getElementById("status").textContent = "🔴 Disconnected";
    stopTracking();
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
