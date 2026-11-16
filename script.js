
// AQUAFIND - Smart Drinking Water Locator

// 1. DEMO WATER POINTS
const waterPoints = [
  { name: "Demo Water Point 1", area: "Kharar Main Market", lat: 30.7465, lng: 76.6465, status: "Demo listing" },
  { name: "Demo Water Point 2", area: "Kharar Bus Stand", lat: 30.7445, lng: 76.6475, status: "Demo listing" },
  { name: "Demo Water Point 3", area: "Kharar Landran Road", lat: 30.7395, lng: 76.6550, status: "Demo listing" },
  { name: "Demo Water Point 4", area: "Sunny Enclave, Kharar", lat: 30.7215, lng: 76.6450, status: "Demo listing" },
  { name: "Demo Water Point 5", area: "Landran, Mohali", lat: 30.6870, lng: 76.6500, status: "Demo listing" },
  { name: "Demo Water Point 6", area: "Airport Road, Mohali", lat: 30.6750, lng: 76.7350, status: "Demo listing" },
  { name: "Demo Water Point 7", area: "Phase 3B2, Mohali", lat: 30.7100, lng: 76.7180, status: "Demo listing" },
  { name: "Demo Water Point 8", area: "Phase 7, Mohali", lat: 30.7050, lng: 76.7080, status: "Demo listing" },
  { name: "Demo Water Point 9", area: "Sector 17, Chandigarh", lat: 30.7415, lng: 76.7820, status: "Demo listing" },
  { name: "Demo Water Point 10", area: "Sector 22, Chandigarh", lat: 30.7330, lng: 76.7720, status: "Demo listing" },
  { name: "Demo Water Point 11", area: "Sector 35, Chandigarh", lat: 30.7190, lng: 76.7510, status: "Demo listing" },
  { name: "Demo Water Point 12", area: "Sector 15, Chandigarh", lat: 30.7590, lng: 76.7680, status: "Demo listing" },
  { name: "Demo Water Point 13", area: "Sector 43, Chandigarh", lat: 30.7140, lng: 76.7560, status: "Demo listing" },
  { name: "Demo Water Point 14", area: "Sector 34, Chandigarh", lat: 30.7250, lng: 76.7620, status: "Demo listing" },
  { name: "Demo Water Point 15", area: "Sector 26, Chandigarh", lat: 30.7270, lng: 76.8010, status: "Demo listing" }
];

let userLocation = null;
let searchText = "";
let map;
let markerLayer;

// 2. INITIALIZE MAP
function initializeMap() {
  const mapElement = document.getElementById("map");

  if (!mapElement) {
    console.error("Map container #map not found.");
    return;
  }

  if (typeof L === "undefined") {
    mapElement.innerHTML = "Map library could not load. Please check your internet connection and refresh.";
    console.error("Leaflet library is missing.");
    return;
  }

  map = L.map("map").setView([30.7333, 76.7794], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  markerLayer = L.layerGroup().addTo(map);

  // Fix map display if the page layout loads slowly
  setTimeout(() => {
    map.invalidateSize();
  }, 500);

  setTimeout(() => {
    map.invalidateSize();
  }, 1500);
}

// 3. DISTANCE CALCULATION
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = value => value * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 4. DISPLAY WATER POINTS
function displayWaterPoints() {
  const list = document.getElementById("waterList");

  if (!list) return;

  list.innerHTML = "";

  if (!map || !markerLayer) {
    list.textContent = "Map is still loading. Please refresh the page.";
    return;
  }

  markerLayer.clearLayers();

  let filtered = waterPoints.filter(point =>
    point.name.toLowerCase().includes(searchText) ||
    point.area.toLowerCase().includes(searchText)
  );

  if (userLocation) {
    filtered.sort((a, b) =>
      calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
      calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
    );
  }

  if (filtered.length === 0) {
    list.textContent = "No matching demo water points found.";
    return;
  }

  filtered.forEach(point => {
    const marker = L.marker([point.lat, point.lng])
      .addTo(markerLayer)
      .bindPopup(
        `<b>${point.name}</b><br>${point.area}<br>${point.status}`
      );

    const card = document.createElement("div");
    card.className = "water-card";

    const title = document.createElement("h3");
    title.textContent = "💧 " + point.name;

    const area = document.createElement("p");
    area.textContent = "📍 " + point.area;

    const status = document.createElement("p");
    status.textContent = "Status: " + point.status;

    card.append(title, area, status);

    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        point.lat,
        point.lng
      );

      const distanceText = document.createElement("p");
      distanceText.textContent =
        "📏 Distance: " + distance.toFixed(2) + " km";

      card.appendChild(distanceText);
    }

    const mapButton = document.createElement("button");
    mapButton.textContent = "View on Map";

    mapButton.addEventListener("click", () => {
      map.setView([point.lat, point.lng], 16);
      marker.openPopup();
    });

    const directionButton = document.createElement("button");
    directionButton.textContent = "Get Directions";
    directionButton.style.marginLeft = "8px";

    directionButton.addEventListener("click", () => {
      const url =
        "https://www.google.com/maps/dir/?api=1&destination=" +
        encodeURIComponent(`${point.lat},${point.lng}`);

      window.open(url, "_blank");
    });

    card.append(mapButton, directionButton);
    list.appendChild(card);
  });
}

// 5. SEARCH
function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", event => {
    searchText = event.target.value.toLowerCase().trim();
    displayWaterPoints();
  });
}

// 6. GPS LOCATION
function setupGPS() {
  const locationButton = document.getElementById("locationBtn");

  if (!locationButton) return;

  locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("GPS is not supported by your browser.");
      return;
    }

    locationButton.textContent = "Finding location...";
    locationButton.disabled = true;

    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        map.setView(
          [userLocation.lat, userLocation.lng],
          13
        );

        displayWaterPoints();

        locationButton.textContent = "📍 Location Found";
        locationButton.disabled = false;

        alert("Location found! Distances have been calculated.");
      },

      error => {
        locationButton.textContent = "📍 Find My Location";
        locationButton.disabled = false;

        alert("GPS error: " + error.message);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

// 7. COMPLAINT HISTORY
function showComplaints() {
  const history = document.getElementById("complaintHistory");

  if (!history) return;

  let complaints = [];

  try {
    complaints = JSON.parse(
      localStorage.getItem("aquafindComplaints") || "[]"
    );
  } catch (error) {
    console.error("Could not read complaint history:", error);
  }

  history.innerHTML = "";

  if (complaints.length === 0) {
    history.textContent = "No complaints submitted yet.";
    return;
  }

  complaints.forEach(item => {
    const card = document.createElement("div");
    card.className = "complaint-card";

    const heading = document.createElement("h3");
    heading.textContent = item.problem;

    const name = document.createElement("p");
    name.textContent = "Reported by: " + item.name;

    const description = document.createElement("p");
    description.textContent = item.description;

    const date = document.createElement("small");
    date.textContent = item.date;

    card.append(heading, name, description, date);
    history.appendChild(card);
  });
}

// 8. SUBMIT COMPLAINT
function setupComplaintForm() {
  const form = document.getElementById("complaintForm");

  if (!form) return;

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("personName").value.trim();
    const problem = document.getElementById("problemType").value;
    const description = document.getElementById("problemDescription").value.trim();

    if (!name || !problem || !description) {
      alert("Please complete all fields.");
      return;
    }

    let complaints = [];

    try {
      complaints = JSON.parse(
        localStorage.getItem("aquafindComplaints") || "[]"
      );
    } catch (error) {
      complaints = [];
    }

    complaints.push({
      name,
      problem,
      description,
      date: new Date().toLocaleString()
    });

    try {
      localStorage.setItem(
        "aquafindComplaints",
        JSON.stringify(complaints)
      );
    } catch (error) {
      alert("Could not save complaint in this browser.");
      return;
    }

    alert("Your demo complaint has been saved!");

    form.reset();
    showComplaints();
  });
}

// 9. START AQUAFIND
document.addEventListener("DOMContentLoaded", () => {
  initializeMap();
  setupSearch();
  setupGPS();
  setupComplaintForm();
  displayWaterPoints();
  showComplaints();
});
