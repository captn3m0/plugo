---
---
mapboxgl.accessToken = "{{site.mapboxtoken}}";
 
const filterGroup = document.getElementById('filter-group');

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  zoom: 7,
  center: [77.61588870000003, 12.9346911],
});
map.on("idle", function () {
  map.resize();
});
map.on("load", (e) => {
  map.resize();
  map.addSource("plugo", {
    type: "geojson",
    data: "map.geojson",
    data: "/plugo/map.geojson",
  });

  map.addLayer({
    id: "markers-zero",
    type: "symbol",
    source: "plugo",
    filter: ['==', 'count', 0],
    layout: {
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "text-allow-overlap": false,
      "icon-size": 1.3,
      "icon-image": ["get", "icon"],
      "text-variable-anchor": ["bottom", "right"],
      "text-radial-offset": 0.7,
      "text-field": ["get", "shorttitle"],
      "visibility": "none",
      "text-size": {
        stops: [
          [0, 0],
          [12, 0],
          [12.99999999, 0],
          [13.0000001, 10],
          [15, 12],
          [20, 15],
        ],
      },
    },
    paint: {
      "text-color": "#202",
      "text-halo-color": "#ff5855",
      "text-halo-blur": 1,
      "text-halo-width": 2,
    },
  });

  map.addLayer({
    id: "markers",
    type: "symbol",
    source: "plugo",
    filter: ['!=', 'count', 0],
    layout: {
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "text-allow-overlap": true,
      "icon-size": 1.3,
      "icon-image": ["get", "icon"],
      "text-variable-anchor": ["bottom", "right"],
      "text-radial-offset": 0.7,
      "text-field": ["get", "shorttitle"],
      "text-size": {
        stops: [
          [0, 0],
          [12, 0],
          [12.99999999, 0],
          [13.0000001, 10],
          [15, 12],
          [20, 15],
        ],
      },
    },
    paint: {
      "icon-color": "#00ff00",
      "text-color": "#202",
      "text-halo-color": "#ebff32",
      "text-halo-blur": 1,
      "text-halo-width": 2,
    },
  });

  
   
  // When the checkbox changes, update the visibility of the layer.
  M = document.getElementById('markers-zero')
  M.addEventListener('change', (e) => {
    map.setLayoutProperty(
      'markers-zero',
      'visibility',
      e.target.checked ? 'visible' : 'none'
    );
  })

  function onclick(e) {
    // Copy coordinates array.
    console.log(e.features)
    const coordinates = e.features[0].geometry.coordinates.slice();
    const P = e.features[0].properties;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(
        `${P.description}<br>${P.count} powerbanks available<br>Location Type: ${P.type}`
      )
      .addTo(map);
  }

  map.on("click", "markers", onclick);
  map.on("click", "markers-zero", onclick);
  map.addControl(new mapboxgl.FullscreenControl());
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      // When active the map will receive updates to the device's location as it changes.
      trackUserLocation: true,
      // Draw an arrow next to the location dot to indicate which direction the device is heading.
      showUserHeading: true,
    })
  );
});