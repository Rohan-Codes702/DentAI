export const DEFAULT_MAP_CENTER = {
  lat: 19.9975,
  lng: 73.7898, // Nashik, MH default coordinates
  zoom: 13,
};

export const generateLeafletMapHTML = (dentists = [], userCoords = null) => {
  const centerLat = userCoords ? userCoords.latitude : DEFAULT_MAP_CENTER.lat;
  const centerLng = userCoords ? userCoords.longitude : DEFAULT_MAP_CENTER.lng;

  const dentistMarkers = dentists.map((d) => {
    const lat = d.address?.coordinates?.lat || centerLat + (Math.random() - 0.5) * 0.04;
    const lng = d.address?.coordinates?.lng || centerLng + (Math.random() - 0.5) * 0.04;
    const name = d.name || 'Dr. Dental Specialist';
    const clinic = d.dentistProfile?.clinicName || 'DentAI Clinic';
    const spec = d.dentistProfile?.specialization || 'General Dentistry';
    const id = d._id || d.id;

    return `
      var marker_${id} = L.marker([${lat}, ${lng}]).addTo(map);
      marker_${id}.bindPopup(\`
        <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
          <h4 style="margin: 0 0 4px 0; color: #0ea5e9; font-size: 14px;">\${escapeHtml("${name}")}</h4>
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #475569;">\${escapeHtml("${clinic}")}</p>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">\${escapeHtml("${spec}")}</p>
          <button onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: 'BOOK_DOCTOR', doctorId: '${id}', doctorName: '${name}'}))" 
            style="background: #0ea5e9; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; width: 100%; cursor: pointer;">
            Book Appointment
          </button>
        </div>
      \`);
    `;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #0f172a; }
          .leaflet-container { background: #0f172a; }
          .leaflet-popup-content-wrapper { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          function escapeHtml(text) {
            return text.replace(/'/g, "\\'");
          }

          var map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 13);
          L.control.zoom({ position: 'bottomright' }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          ${userCoords ? `
            var userIcon = L.divIcon({
              className: 'user-location-pin',
              html: '<div style="background:#10b981; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 10px #10b981;"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            L.marker([${centerLat}, ${centerLng}], {icon: userIcon}).addTo(map).bindPopup("<b>You are here</b>");
          ` : ''}

          ${dentistMarkers}
        </script>
      </body>
    </html>
  `;
};
