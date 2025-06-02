const socket = io();

 
 

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        socket.emit("send-location" ,{ latitude,longitude});
        socket.emit("locationUpdate", { latitude, longitude });
    },
    (error) => {
        console.log(error);
    },
    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 3000,
    }
    
);
}

const map = L.map("map").setView([0,0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "opesource_maps"
}).addTo(map);

const marker = {};

socket.on("connect" , ()=>{
    document.getElementById("status").textContent = "🟢 Connected";
});

socket.on("disconnect", () => {
    document.getElementById("status").textContent = "🔴 Disconnected";
});

socket.on("recieve-location", (data)=>{
    const {id,latitude,longitude} = data;
    map.setView([latitude,longitude]);
    if(marker[id]){
        marker[id].setLatLng([latitude, longitude]);
    
    } else{
        marker[id] = L.marker([latitude,longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id)=>{
    
    if(marker[id]) {
        map.removeLayer(marker[id]);
        delete marker[id];
    }
});

socket.on("recieve-location" , (data)=>{
    document.getElementById("lat").textContent = data.latitude.toFixed(5);
    document.getElementById("lng").textContent = data.longitude.toFixed(5);
    document.getElementById("lastUpdate").textContent = new Date().toLocaleTimeString();
     
});
