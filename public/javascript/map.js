maptilersdk.config.apiKey = mapToken;
// const map = new maptilersdk.Map({
//   container: "map",
//   style: maptilersdk.MapStyle.STREETS,
//   center: [74.8021, 34.0837],
//   zoom: 14,
// });

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.STREETS,
  center: coordinates, // Dynamic coordinates
  zoom: 14,
});

console.log("Map Token:", mapToken); // Should log your API key
console.log("Coordinates:", coordinates); // Should log [longitude, latitude]

new maptilersdk.Marker().setLngLat(coordinates).addTo(map);
