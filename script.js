
// AquaFind - Smart Drinking Water Locator

// Demo water points (not verified real facilities)
const waterPoints = [
  {
    name: "Demo Water Point 1",
    area: "Sector 17, Chandigarh",
    lat: 30.7415,
    lng: 76.7820,
    status: "Demo listing"
  },
  {
    name: "Demo Water Point 2",
    area: "Sector 22, Chandigarh",
    lat: 30.7330,
    lng: 76.7720,
    status: "Demo listing"
  },
  {
    name: "Demo Water Point 3",
    area: "Sector 35, Chandigarh",
    lat: 30.7190,
    lng: 76.7510,
    status: "Demo listing"
  }
];

// Create map
const map = L.map("map").setView([30.7333, 76.7794], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

// Display water points
function displayWaterPoints(points) {
  markerLayer.clearLayers();

  const list = document.getElementById("waterList");
  list.innerHTML = "";

  if (points.length === 0) {
    list.textContent = "No matching demo water points found.";
    return;
  }

  points.forEach(point => {
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
    area.textContent = point.area;

    const status = document.createElement("p");
    status.textContent = point.status;

    const button = document.createElement("button");
    button.textContent = "View on Map";
    button.addEventListener("click", () => {
      map.setView([point.lat, point.lng], 16);
      marker.openPopup();
    });

    card.append(title, area, status, button);
    list.appendChild(card);
  });
}

displayWaterPoints(waterPoints);

// Search water points
document.getElementById("searchInput").addEventListener("input", event => {
  const search = event.target.value.toLowerCase();

  const filtered = waterPoints.filter(point =>
    point.name.toLowerCase().includes(search) ||
    point.area.toLowerCase().includes(search)
  );

  displayWaterPoints(filtered);
});

// Find current location
document.getElementById("locationBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Location is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      map.setView([lat, lng], 16);

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("Your current location")
        .openPopup();
    },
    () => {
      alert("Could not access your location. Please allow location permission.");
    }
  );
});

// Load complaint history
function showComplaints() {
  const complaints = JSON.parse(
    localStorage.getItem("aquafindComplaints") || "[]"
  );

  const history = document.getElementById("complaintHistory");
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

// Submit complaint
document.getElementById("complaintForm").addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("personName").value.trim();
  const problem = document.getElementById("problemType").value;
  const description = document.getElementById("problemDescription").value.trim();

  if (!name || !problem || !description) {
    alert("Please complete all fields.");
    return;
  }

  const complaints = JSON.parse(
    localStorage.getItem("aquafindComplaints") || "[]"
  );

  complaints.push({
    name,
    problem,
    description,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("aquafindComplaints", JSON.stringify(complaints));

  alert("Your demo complaint has been saved!");

  document.getElementById("complaintForm").reset();
  showComplaints();
});

// Show saved complaints when app opens
showComplaints();
