// import { useEffect, useState, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";
// import { io } from "socket.io-client";
// import toast from "react-hot-toast";

// // 🚌 Custom Bus Icon
// const busIcon = new L.Icon({
//   iconUrl: `data:image/svg+xml;utf8,
//     <svg xmlns="http://www.w3.org/2000/svg" 
//       width="24" height="24" viewBox="0 0 24 24" 
//       fill="none" stroke="green" stroke-width="2" 
//       stroke-linecap="round" stroke-linejoin="round" 
//       class="lucide lucide-bus-front">
//         <path d="M4 6 2 7"/>
//         <path d="M10 6h4"/>
//         <path d="m22 7-2-1"/>
//         <rect width="16" height="16" x="4" y="3" rx="2"/>
//         <path d="M4 11h16"/>
//         <path d="M8 15h.01"/>
//         <path d="M16 15h.01"/>
//         <path d="M6 19v2"/>
//         <path d="M18 21v-2"/>
//     </svg>`,
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
//   popupAnchor: [0, -32],
// });

// // 👤 Custom User Location Icon
// const userLocationIcon = L.divIcon({
//   className: "user-location-icon",
//   html: `<div class="relative flex items-center justify-center w-5 h-5">
//             <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
//             <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
//           </div>`,
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// // 🗺️ Center map on selected stop
// function PanToStop({ selectedStop, mapRef }) {
//   useEffect(() => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;
//     const coords = selectedStop?.location?.coordinates;
//     const lat = selectedStop?.location?.latitude;
//     const lng = selectedStop?.location?.longitude;

//     if (Array.isArray(coords) && coords.length === 2) {
//       const [lngCoord, latCoord] = coords;
//       map.flyTo([latCoord, lngCoord], 16, { animate: true });
//     } else if (typeof lat === "number" && typeof lng === "number") {
//       map.flyTo([lat, lng], 16, { animate: true });
//     }
//   }, [selectedStop, mapRef]);

//   return null;
// }

// // 🔍 Distance in KM between two lat/lng points
// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//     Math.cos((lat2 * Math.PI) / 180) *
//     Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// // 🕒 Estimate ETA (minutes) given distance and speed (20 km/h default)
// function getETA(distanceKm, speedKmh = 20) {
//   return Math.ceil((distanceKm / speedKmh) * 60);
// }

// // 🧭 Determines bus direction based on distance comparison
// function getDirection(currentDistance, previousDistance) {
//   if (previousDistance === null || previousDistance === currentDistance) {
//     return "stopped";
//   }
//   return currentDistance < previousDistance ? "approaching" : "moving away";
// }

// // MapComponent now accepts props
// export default function MapComponent({ selectedStop, setSelectedStop }) {
//   const [buses, setBuses] = useState([]);
//   const [stops, setStops] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const [distanceToStop, setDistanceToStop] = useState(null);
//   const [routeLoading, setRouteLoading] = useState(false);
//   const [nearestStopForUser, setNearestStopForUser] = useState(null);
//   const mapRef = useRef(null);
//   const busMarkersRef = useRef({});
//   const stopMarkersRef = useRef({});
//   const polylineRef = useRef(null);
//   const lastPlottedRouteRef = useRef(null);
//   const busTrackingRef = useRef({});

//   // Effect for initial map setup and cleanup
//   useEffect(() => {
//     const map = L.map('map-container').setView([30.1775, 66.9900], 15);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
//     mapRef.current = map;

//     // Clean up the map instance when the component unmounts
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []); // Run only once

//   // Effect for fetching initial data (buses and stops) and handling the socket
//   useEffect(() => {
//     // This part now handles fetching both via API and socket
//     const fetchData = async () => {
//       try {
//         const [busRes, stopRes] = await Promise.all([
//           axios.get("/api/buses/public"),
//           axios.get("/api/stops/public"),
//         ]);
//         setBuses(busRes.data);
//         setStops(stopRes.data);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();

//     // Socket.IO Connection Logic
//     const socket = io("http://localhost:5000");

//     socket.on("connect", () => {
//       console.log("✅ Socket.IO connected");
//       // 1. Send event to request current bus data immediately upon connection
//       socket.emit("requestInitialBusData");
//     });

//     // 2. Listen for the initial bus data from the server
//     socket.on("initialBusData", (initialBuses) => {
//       console.log("📥 Received initial bus data:", initialBuses);
//       setBuses(initialBuses);
//     });

//     socket.on("busLocationUpdate", ({ driverId, busId, latitude, longitude }) => {
//       console.log("📡 Location update:", { driverId, busId, latitude, longitude });

//       setBuses((prev) => {
//         const existing = prev.find((b) => b._id === busId);
//         if (existing) {
//           // Update existing bus
//           return prev.map((bus) =>
//             bus._id === busId
//               ? { ...bus, currentLocation: { latitude, longitude } }
//               : bus
//           );
//         } else {
//           // Create new bus if not found
//           return [
//             ...prev,
//             {
//               _id: busId,
//               number: `Bus ${busId.slice(-4)}`, // fallback label
//               driver: { _id: driverId },
//               currentLocation: { latitude, longitude },
//             },
//           ];
//         }
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Effect for fetching user location and finding the nearest stop
//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

//       const geoSuccess = (pos) => {
//         const userLoc = {
//           latitude: pos.coords.latitude,
//           longitude: pos.coords.longitude,
//         };
//         setUserLocation(userLoc);

//         if (stops.length > 0) {
//           let closestStop = null;
//           let minDistance = Infinity;

//           stops.forEach((stop) => {
//             if (stop.location) {
//               const distance = getDistanceFromLatLonInKm(
//                 userLoc.latitude,
//                 userLoc.longitude,
//                 stop.location.latitude,
//                 stop.location.longitude
//               );
//               if (distance < minDistance) {
//                 minDistance = distance;
//                 closestStop = stop;
//               }
//             }
//           });
//           setNearestStopForUser(closestStop);
//         }
//       };

//       const geoError = (err) => console.warn("Geolocation error:", err.message);

//       // Start watching the user's location for continuous updates
//       const watchId = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);

//       // Cleanup function to stop watching when the component unmounts
//       return () => navigator.geolocation.clearWatch(watchId);
//     }
//   }, [stops]);

//   // Effect for updating map markers
//   useEffect(() => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;

//     // 🚍 Update/Add Bus Markers
//     const existingBusIds = new Set(buses.map(bus => bus._id));

//     // Remove markers for buses that are no longer in the state
//     Object.keys(busMarkersRef.current).forEach(busId => {
//       if (!existingBusIds.has(busId)) {
//         busMarkersRef.current[busId].remove();
//         delete busMarkersRef.current[busId];
//       }
//     });

//     buses.forEach((bus) => {
//       if (bus.currentLocation) {
//         const latlng = [
//           bus.currentLocation.latitude,
//           bus.currentLocation.longitude,
//         ];

//         let popupContent = `<strong>Bus #${bus.number}</strong><br/>`;

//         if (nearestStopForUser && nearestStopForUser.location) {
//           const busDistanceToStop = getDistanceFromLatLonInKm(
//             bus.currentLocation.latitude,
//             bus.currentLocation.longitude,
//             nearestStopForUser.location.latitude,
//             nearestStopForUser.location.longitude
//           );
//           const eta = getETA(busDistanceToStop);

//           // Correctly retrieve and store previous and current distances
//           const previousDistance = busTrackingRef.current[bus._id]?.currentDistance;
//           const direction = getDirection(busDistanceToStop, previousDistance);

//           if (!busTrackingRef.current[bus._id]) {
//             busTrackingRef.current[bus._id] = { previousDistance: null };
//           }
//           busTrackingRef.current[bus._id].currentDistance = busDistanceToStop;

//           popupContent += `
//             <strong><br/>To nearest stop: ${nearestStopForUser.name}</strong><br/>
//             📏 Distance: ${busDistanceToStop.toFixed(2)} km<br/>
//             🕒 ETA: ${eta} min<br/>
//             🧭 Direction: ${direction === 'approaching' ? 'Approaching' : direction === 'moving away' ? 'Moving Away' : 'Stopped'}
//           `;
//         } else {
//           popupContent += `<br/>Waiting for user location to find nearest stop...`;
//         }

//         if (busMarkersRef.current[bus._id]) {
//           busMarkersRef.current[bus._id].setLatLng(latlng);
//           busMarkersRef.current[bus._id].setPopupContent(popupContent);
//         } else {
//           const marker = L.marker(latlng, { icon: busIcon }).addTo(map);
//           marker.bindPopup(popupContent);
//           busMarkersRef.current[bus._id] = marker;
//         }
//       } else {
//         if (busMarkersRef.current[bus._id]) {
//           busMarkersRef.current[bus._id].remove();
//           delete busMarkersRef.current[bus._id];
//         }
//       }
//     });

//     // 👤 User marker
//     if (busMarkersRef.current['user']) {
//       busMarkersRef.current['user'].remove();
//       delete busMarkersRef.current['user'];
//     }
//     if (userLocation) {
//       const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userLocationIcon }).addTo(map);
//       busMarkersRef.current['user'] = userMarker;
//     }

//     // 🚏 Update/Add Stop Markers
//     Object.values(stopMarkersRef.current).forEach(marker => marker.remove());
//     stopMarkersRef.current = {};
//     stops.forEach(stop => {
//       if (stop.location) {
//         const marker = L.marker([stop.location.latitude, stop.location.longitude]).addTo(map);
//         marker.bindPopup(`<strong>${stop.name}</strong>`);
//         marker.on('click', () => setSelectedStop(stop));
//         stopMarkersRef.current[stop._id] = marker;
//       }
//     });

//     // 🚍 Update Nearby Bus Markers
//     const nearbyBuses = getNearbyBuses();
//     Object.keys(busMarkersRef.current).filter(key => key.startsWith('nearby-')).forEach(key => {
//       busMarkersRef.current[key].remove();
//       delete busMarkersRef.current[key];
//     });

//     nearbyBuses.forEach((bus, idx) => {
//       const eta = getETA(bus.distance);
//       let directionIndicator = "";
//       const previousDistance = busTrackingRef.current[bus._id]?.previousDistance;
//       const direction = getDirection(bus.distance, previousDistance);

//       if (direction === "approaching") {
//         directionIndicator = "➡️";
//       } else if (direction === "moving away") {
//         directionIndicator = "⬅️";
//       }

//       const icon = L.divIcon({
//         className: "nearby-bus-icon",
//         html: `<div style="background:#facc15;padding:4px 8px;border-radius:6px;font-size:12px;">
//            🚍 ${bus.distance.toFixed(1)} km, ETA ${eta} min ${directionIndicator}
//         </div>`,
//       });
//       const marker = L.marker([bus.currentLocation.latitude, bus.currentLocation.longitude], { icon: icon }).addTo(map);
//       busMarkersRef.current[`nearby-${bus._id}-${idx}`] = marker;
//     });

//   }, [buses, stops, userLocation, selectedStop, nearestStopForUser]);

//   // Effect for calculating distance to stop
//   useEffect(() => {
//     if (!selectedStop || !userLocation) {
//       setDistanceToStop(null);
//       return;
//     }

//     let stopLat, stopLng;
//     if (
//       selectedStop?.location?.coordinates &&
//       Array.isArray(selectedStop.location.coordinates) &&
//       selectedStop.location.coordinates.length === 2
//     ) {
//       [stopLng, stopLat] = selectedStop.location.coordinates;
//     } else if (
//       typeof selectedStop?.location?.latitude === "number" &&
//       typeof selectedStop?.location?.longitude === "number"
//     ) {
//       stopLat = selectedStop.location.latitude;
//       stopLng = selectedStop.location.longitude;
//     } else {
//       console.warn("❌ Invalid stop coordinates");
//       setDistanceToStop(null);
//       return;
//     }

//     const dist = getDistanceFromLatLonInKm(
//       userLocation.latitude,
//       userLocation.longitude,
//       stopLat,
//       stopLng
//     );

//     setDistanceToStop(dist);
//   }, [userLocation, selectedStop]);

//   // Effect for plotting the route line
//   useEffect(() => {
//     if (!mapRef.current || !userLocation || !selectedStop) {
//       if (polylineRef.current) {
//         mapRef.current.removeLayer(polylineRef.current);
//         polylineRef.current = null;
//       }
//       return;
//     }
//     const currentRouteKey = `${userLocation.latitude},${userLocation.longitude}-${selectedStop._id}`;
//     if (lastPlottedRouteRef.current === currentRouteKey) {
//       return;
//     }
//     const fetchRoute = async () => {
//       setRouteLoading(true);
//       if (polylineRef.current) {
//         mapRef.current.removeLayer(polylineRef.current);
//         polylineRef.current = null;
//       }
//       let stopLat, stopLng;
//       if (
//         selectedStop?.location?.coordinates &&
//         Array.isArray(selectedStop.location.coordinates) &&
//         selectedStop.location.coordinates.length === 2
//       ) {
//         [stopLng, stopLat] = selectedStop.location.coordinates;
//       } else if (
//         typeof selectedStop?.location?.latitude === "number" &&
//         typeof selectedStop?.location?.longitude === "number"
//       ) {
//         stopLat = selectedStop.location.latitude;
//         stopLng = selectedStop.location.longitude;
//       }
//       if (!stopLat || !stopLng) {
//         setRouteLoading(false);
//         return;
//       }
//       const coordinates = `${userLocation.longitude},${userLocation.latitude};${stopLng},${stopLat}`;
//       const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
//       try {
//         const response = await axios.get(url, { timeout: 10000 });
//         const route = response.data.routes[0];

//         if (route && route.geometry && route.geometry.coordinates) {
//           const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
//           const polyline = L.polyline(latLngs, {
//             color: '#3b82f6',
//             weight: 4,
//             opacity: 0.8,
//           }).addTo(mapRef.current);
//           polylineRef.current = polyline;
//           lastPlottedRouteRef.current = currentRouteKey;
//         } else {
//           toast.error("No route found between your location and the stop.");
//         }
//       } catch (error) {
//         console.error("Error fetching route:", error);
//         if (axios.isCancel(error)) {
//           toast.error("Route request timed out.");
//         } else if (error.response?.status === 500) {
//           toast.error("OSRM server error. Please try again later.");
//         } else {
//           toast.error("Failed to load route.");
//         }
//       } finally {
//         setRouteLoading(false);
//       }
//     };
//     fetchRoute();
//   }, [userLocation, selectedStop]);

//   const getNearbyBuses = () => {
//     if (
//       !selectedStop ||
//       !selectedStop.location ||
//       !Array.isArray(selectedStop.location.coordinates) ||
//       selectedStop.location.coordinates.length < 2
//     ) {
//       return [];
//     }
//     const [stopLng, stopLat] = selectedStop.location.coordinates;
//     return buses
//       .filter((bus) => bus.currentLocation)
//       .map((bus) => {
//         const distance = getDistanceFromLatLonInKm(
//           stopLat,
//           stopLng,
//           bus.currentLocation.latitude,
//           bus.currentLocation.longitude
//         );
//         return { ...bus, distance };
//       })
//       .filter((bus) => bus.distance < 2)
//       .sort((a, b) => a.distance - b.distance)
//       .slice(0, 3);
//   };

//   // This useEffect is now local and doesn't affect the parent
//   useEffect(() => {
//     if (selectedStop) {
//       localStorage.setItem("selectedStop", JSON.stringify(selectedStop));
//     }
//   }, [selectedStop]);

//   return (
//     <div id="map-container" className="h-full w-full z-0">
//       <PanToStop selectedStop={selectedStop} mapRef={mapRef} />
//       {selectedStop && (
//         <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md shadow-md rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
//           <div className="font-medium mb-1">
//             📍 {selectedStop.name || "Selected Stop"}
//           </div>
//           {routeLoading && (
//             <div className="flex items-center text-gray-500 mt-1">
//               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Calculating route...
//             </div>
//           )}
//           {userLocation && distanceToStop !== null && !routeLoading ? (
//             <div>
//               📏 Distance:{" "}
//               {distanceToStop > 1
//                 ? `${distanceToStop.toFixed(2)} km`
//                 : `${(distanceToStop * 1000).toFixed(0)} m`}
//             </div>
//           ) : (
//             <div className="text-red-600">
//               🚫 Enable location to get distance
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


// MapComponent.jsx
// import { useEffect, useState, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";
// import { io } from "socket.io-client";
// import toast from "react-hot-toast";
// import SearchBar from "../components/Navbar/SearchBar";

// // 🚌 Custom Bus Icon
// const busIcon = new L.Icon({
//   iconUrl: `data:image/svg+xml;utf8,
//     <svg xmlns="http://www.w3.org/2000/svg" 
//       width="24" height="24" viewBox="0 0 24 24" 
//       fill="none" stroke="green" stroke-width="2" 
//       stroke-linecap="round" stroke-linejoin="round" 
//       class="lucide lucide-bus-front">
//         <path d="M4 6 2 7"/>
//         <path d="M10 6h4"/>
//         <path d="m22 7-2-1"/>
//         <rect width="16" height="16" x="4" y="3" rx="2"/>
//         <path d="M4 11h16"/>
//         <path d="M8 15h.01"/>
//         <path d="M16 15h.01"/>
//         <path d="M6 19v2"/>
//         <path d="M18 21v-2"/>
//     </svg>`,
//   iconSize: [32, 32],
//   iconAnchor: [16, 32],
//   popupAnchor: [0, -32],
// });

// // 👤 Custom User Location Icon
// const userLocationIcon = L.divIcon({
//   className: "user-location-icon",
//   html: `<div class="relative flex items-center justify-center w-5 h-5">
//             <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
//             <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
//           </div>`,
//   iconSize: [20, 20],
//   iconAnchor: [10, 10],
// });

// /** ✅ Helper: robustly extract lat/lng from various stop shapes */
// function extractStopLatLng(stop) {
//   if (!stop) return null;

//   // 1) location.coordinates = [lng, lat]
//   const coords = stop?.location?.coordinates;
//   if (Array.isArray(coords) && coords.length === 2) {
//     const [lng, lat] = coords;
//     if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
//   }

//   // 2) location.latitude/longitude
//   const latA = stop?.location?.latitude;
//   const lngA = stop?.location?.longitude;
//   if (typeof latA === "number" && typeof lngA === "number") {
//     return { lat: latA, lng: lngA };
//   }

//   // 3) top-level lat/lng or lat/lon
//   const latB = stop?.lat ?? stop?.latitude;
//   const lngB = stop?.lng ?? stop?.lon ?? stop?.longitude;
//   if (typeof latB === "number" && typeof lngB === "number") {
//     return { lat: latB, lng: lngB };
//   }

//   return null;
// }

// // 🗺️ Center map on selected stop
// function PanToStop({ selectedStop, mapRef }) {
//   useEffect(() => {
//     if (!mapRef.current || !selectedStop) return;
//     const map = mapRef.current;

//     // Original logic (kept)
//     const coords = selectedStop?.location?.coordinates;
//     const lat = selectedStop?.location?.latitude;
//     const lng = selectedStop?.location?.longitude;

//     if (Array.isArray(coords) && coords.length === 2) {
//       const [lngCoord, latCoord] = coords;
//       map.flyTo([latCoord, lngCoord], 16, { animate: true });
//       return;
//     } else if (typeof lat === "number" && typeof lng === "number") {
//       map.flyTo([lat, lng], 16, { animate: true });
//       return;
//     }

//     // ✅ Fallback if the stop came from SearchBar with a different shape
//     const parsed = extractStopLatLng(selectedStop);
//     if (parsed) {
//       map.flyTo([parsed.lat, parsed.lng], 16, { animate: true });
//     }
//   }, [selectedStop, mapRef]);

//   return null;
// }

// // 🔍 Distance in KM between two lat/lng points
// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// }

// // 🕒 Estimate ETA (minutes) given distance and speed (20 km/h default)
// function getETA(distanceKm, speedKmh = 20) {
//   return Math.ceil((distanceKm / speedKmh) * 60);
// }

// // 🧭 Determines bus direction based on distance comparison
// function getDirection(currentDistance, previousDistance) {
//   if (previousDistance === null || previousDistance === currentDistance) {
//     return "stopped";
//   }
//   return currentDistance < previousDistance ? "approaching" : "moving away";
// }

// // MapComponent now accepts props
// export default function MapComponent({ selectedStop, setSelectedStop }) {
//   const [buses, setBuses] = useState([]);
//   const [stops, setStops] = useState([]);
//   const [userLocation, setUserLocation] = useState(null);
//   const [distanceToStop, setDistanceToStop] = useState(null);
//   const [routeLoading, setRouteLoading] = useState(false);
//   const [nearestStopForUser, setNearestStopForUser] = useState(null);
//   const mapRef = useRef(null);
//   const busMarkersRef = useRef({});
//   const stopMarkersRef = useRef({});
//   const polylineRef = useRef(null);
//   const lastPlottedRouteRef = useRef(null);
//   const busTrackingRef = useRef({});

//   // Effect for initial map setup and cleanup
//   useEffect(() => {
//     const map = L.map("map-container").setView([30.1775, 66.99], 15);
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
//       map
//     );
//     mapRef.current = map;

//     // Clean up the map instance when the component unmounts
//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []); // Run only once

//   // Effect for fetching initial data (buses and stops) and handling the socket
//   useEffect(() => {
//     // This part now handles fetching both via API and socket
//     const fetchData = async () => {
//       try {
//         const [busRes, stopRes] = await Promise.all([
//           axios.get("/api/buses/public"),
//           axios.get("/api/stops/public"),
//         ]);
//         setBuses(busRes.data);
//         setStops(stopRes.data);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();

//     // Socket.IO Connection Logic
//     const socket = io("http://localhost:5000");

//     socket.on("connect", () => {
//       console.log("✅ Socket.IO connected");
//       // 1. Send event to request current bus data immediately upon connection
//       socket.emit("requestInitialBusData");
//     });

//     // 2. Listen for the initial bus data from the server
//     socket.on("initialBusData", (initialBuses) => {
//       console.log("📥 Received initial bus data:", initialBuses);
//       setBuses(initialBuses);
//     });

//     socket.on(
//       "busLocationUpdate",
//       ({ driverId, busId, latitude, longitude }) => {
//         console.log("📡 Location update:", {
//           driverId,
//           busId,
//           latitude,
//           longitude,
//         });

//         setBuses((prev) => {
//           const existing = prev.find((b) => b._id === busId);
//           if (existing) {
//             // Update existing bus
//             return prev.map((bus) =>
//               bus._id === busId
//                 ? { ...bus, currentLocation: { latitude, longitude } }
//                 : bus
//             );
//           } else {
//             // Create new bus if not found
//             return [
//               ...prev,
//               {
//                 _id: busId,
//                 number: `Bus ${busId.slice(-4)}`, // fallback label
//                 driver: { _id: driverId },
//                 currentLocation: { latitude, longitude },
//               },
//             ];
//           }
//         });
//       }
//     );

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Effect for fetching user location and finding the nearest stop
//   useEffect(() => {
//     if ("geolocation" in navigator) {
//       const geoOptions = {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       };

//       const geoSuccess = (pos) => {
//         const userLoc = {
//           latitude: pos.coords.latitude,
//           longitude: pos.coords.longitude,
//         };
//         setUserLocation(userLoc);

//         if (stops.length > 0) {
//           let closestStop = null;
//           let minDistance = Infinity;

//           stops.forEach((stop) => {
//             if (stop.location) {
//               const distance = getDistanceFromLatLonInKm(
//                 userLoc.latitude,
//                 userLoc.longitude,
//                 stop.location.latitude,
//                 stop.location.longitude
//               );
//               if (distance < minDistance) {
//                 minDistance = distance;
//                 closestStop = stop;
//               }
//             }
//           });
//           setNearestStopForUser(closestStop);
//         }
//       };

//       const geoError = (err) => console.warn("Geolocation error:", err.message);

//       // Start watching the user's location for continuous updates
//       const watchId = navigator.geolocation.watchPosition(
//         geoSuccess,
//         geoError,
//         geoOptions
//       );

//       // Cleanup function to stop watching when the component unmounts
//       return () => navigator.geolocation.clearWatch(watchId);
//     }
//   }, [stops]);

//   // Effect for updating map markers
//   useEffect(() => {
//     if (!mapRef.current) return;
//     const map = mapRef.current;

//     // 🚍 Update/Add Bus Markers
//     const existingBusIds = new Set(buses.map((bus) => bus._id));

//     // Remove markers for buses that are no longer in the state
//     Object.keys(busMarkersRef.current).forEach((busId) => {
//       if (!existingBusIds.has(busId)) {
//         busMarkersRef.current[busId].remove();
//         delete busMarkersRef.current[busId];
//       }
//     });

//     buses.forEach((bus) => {
//       if (bus.currentLocation) {
//         const latlng = [
//           bus.currentLocation.latitude,
//           bus.currentLocation.longitude,
//         ];

//         let popupContent = `<strong>Bus #${bus.number}</strong><br/>`;

//         if (nearestStopForUser && nearestStopForUser.location) {
//           const busDistanceToStop = getDistanceFromLatLonInKm(
//             bus.currentLocation.latitude,
//             bus.currentLocation.longitude,
//             nearestStopForUser.location.latitude,
//             nearestStopForUser.location.longitude
//           );
//           const eta = getETA(busDistanceToStop);

//           // Correctly retrieve and store previous and current distances
//           const previousDistance =
//             busTrackingRef.current[bus._id]?.currentDistance;
//           const direction = getDirection(busDistanceToStop, previousDistance);

//           if (!busTrackingRef.current[bus._id]) {
//             busTrackingRef.current[bus._id] = { previousDistance: null };
//           }
//           busTrackingRef.current[bus._id].currentDistance = busDistanceToStop;

//           popupContent += `
//             <strong><br/>To nearest stop: ${nearestStopForUser.name}</strong><br/>
//             📏 Distance: ${busDistanceToStop.toFixed(2)} km<br/>
//             🕒 ETA: ${eta} min<br/>
//             🧭 Direction: ${
//               direction === "approaching"
//                 ? "Approaching"
//                 : direction === "moving away"
//                 ? "Moving Away"
//                 : "Stopped"
//             }
//           `;
//         } else {
//           popupContent += `<br/>Waiting for user location to find nearest stop...`;
//         }

//         if (busMarkersRef.current[bus._id]) {
//           busMarkersRef.current[bus._id].setLatLng(latlng);
//           busMarkersRef.current[bus._id].setPopupContent(popupContent);
//         } else {
//           const marker = L.marker(latlng, { icon: busIcon }).addTo(map);
//           marker.bindPopup(popupContent);
//           busMarkersRef.current[bus._id] = marker;
//         }
//       } else {
//         if (busMarkersRef.current[bus._id]) {
//           busMarkersRef.current[bus._id].remove();
//           delete busMarkersRef.current[bus._id];
//         }
//       }
//     });

//     // 👤 User marker
//     if (busMarkersRef.current["user"]) {
//       busMarkersRef.current["user"].remove();
//       delete busMarkersRef.current["user"];
//     }
//     if (userLocation) {
//       const userMarker = L.marker(
//         [userLocation.latitude, userLocation.longitude],
//         { icon: userLocationIcon }
//       ).addTo(map);
//       busMarkersRef.current["user"] = userMarker;
//     }

//     // 🚏 Update/Add Stop Markers
//     Object.values(stopMarkersRef.current).forEach((marker) => marker.remove());
//     stopMarkersRef.current = {};
//     stops.forEach((stop) => {
//       if (stop.location) {
//         const marker = L.marker(
//           [stop.location.latitude, stop.location.longitude]
//         ).addTo(map);
//         marker.bindPopup(`<strong>${stop.name}</strong>`);
//         marker.on("click", () => setSelectedStop(stop));
//         stopMarkersRef.current[stop._id] = marker;
//       }
//     });

//     // 🚍 Update Nearby Bus Markers
//     const nearbyBuses = getNearbyBuses();
//     Object.keys(busMarkersRef.current)
//       .filter((key) => key.startsWith("nearby-"))
//       .forEach((key) => {
//         busMarkersRef.current[key].remove();
//         delete busMarkersRef.current[key];
//       });

//     nearbyBuses.forEach((bus, idx) => {
//       const eta = getETA(bus.distance);
//       let directionIndicator = "";
//       const previousDistance = busTrackingRef.current[bus._id]?.previousDistance;
//       const direction = getDirection(bus.distance, previousDistance);

//       if (direction === "approaching") {
//         directionIndicator = "➡️";
//       } else if (direction === "moving away") {
//         directionIndicator = "⬅️";
//       }

//       const icon = L.divIcon({
//         className: "nearby-bus-icon",
//         html: `<div style="background:#facc15;padding:4px 8px;border-radius:6px;font-size:12px;">
//            🚍 ${bus.distance.toFixed(1)} km, ETA ${eta} min ${directionIndicator}
//         </div>`,
//       });
//       const marker = L.marker(
//         [bus.currentLocation.latitude, bus.currentLocation.longitude],
//         { icon: icon }
//       ).addTo(map);
//       busMarkersRef.current[`nearby-${bus._id}-${idx}`] = marker;
//     });
//   }, [buses, stops, userLocation, selectedStop, nearestStopForUser]);

//   // Effect for calculating distance to stop
//   useEffect(() => {
//     if (!selectedStop || !userLocation) {
//       setDistanceToStop(null);
//       return;
//     }

//     let stopLat, stopLng;
//     if (
//       selectedStop?.location?.coordinates &&
//       Array.isArray(selectedStop.location.coordinates) &&
//       selectedStop.location.coordinates.length === 2
//     ) {
//       [stopLng, stopLat] = selectedStop.location.coordinates;
//     } else if (
//       typeof selectedStop?.location?.latitude === "number" &&
//       typeof selectedStop?.location?.longitude === "number"
//     ) {
//       stopLat = selectedStop.location.latitude;
//       stopLng = selectedStop.location.longitude;
//     } else {
//       // ✅ Fallback for SearchBar-provided shapes
//       const parsed = extractStopLatLng(selectedStop);
//       if (parsed) {
//         stopLat = parsed.lat;
//         stopLng = parsed.lng;
//       } else {
//         console.warn("❌ Invalid stop coordinates");
//         setDistanceToStop(null);
//         return;
//       }
//     }

//     const dist = getDistanceFromLatLonInKm(
//       userLocation.latitude,
//       userLocation.longitude,
//       stopLat,
//       stopLng
//     );

//     setDistanceToStop(dist);
//   }, [userLocation, selectedStop]);

//   // Effect for plotting the route line
//   useEffect(() => {
//     if (!mapRef.current || !userLocation || !selectedStop) {
//       if (polylineRef.current) {
//         mapRef.current.removeLayer(polylineRef.current);
//         polylineRef.current = null;
//       }
//       return;
//     }
//     const currentRouteKey = `${userLocation.latitude},${userLocation.longitude}-${selectedStop._id}`;
//     if (lastPlottedRouteRef.current === currentRouteKey) {
//       return;
//     }
//     const fetchRoute = async () => {
//       setRouteLoading(true);
//       if (polylineRef.current) {
//         mapRef.current.removeLayer(polylineRef.current);
//         polylineRef.current = null;
//       }
//       let stopLat, stopLng;
//       if (
//         selectedStop?.location?.coordinates &&
//         Array.isArray(selectedStop.location.coordinates) &&
//         selectedStop.location.coordinates.length === 2
//       ) {
//         [stopLng, stopLat] = selectedStop.location.coordinates;
//       } else if (
//         typeof selectedStop?.location?.latitude === "number" &&
//         typeof selectedStop?.location?.longitude === "number"
//       ) {
//         stopLat = selectedStop.location.latitude;
//         stopLng = selectedStop.location.longitude;
//       } else {
//         // ✅ Fallback for SearchBar-provided shapes
//         const parsed = extractStopLatLng(selectedStop);
//         if (parsed) {
//           stopLat = parsed.lat;
//           stopLng = parsed.lng;
//         }
//       }
//       if (!stopLat || !stopLng) {
//         setRouteLoading(false);
//         return;
//       }
//       const coordinates = `${userLocation.longitude},${userLocation.latitude};${stopLng},${stopLat}`;
//       const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
//       try {
//         const response = await axios.get(url, { timeout: 10000 });
//         const route = response.data.routes[0];

//         if (route && route.geometry && route.geometry.coordinates) {
//           const latLngs = route.geometry.coordinates.map((coord) => [
//             coord[1],
//             coord[0],
//           ]);
//           const polyline = L.polyline(latLngs, {
//             color: "#3b82f6",
//             weight: 4,
//             opacity: 0.8,
//           }).addTo(mapRef.current);
//           polylineRef.current = polyline;
//           lastPlottedRouteRef.current = currentRouteKey;
//         } else {
//           toast.error("No route found between your location and the stop.");
//         }
//       } catch (error) {
//         console.error("Error fetching route:", error);
//         if (axios.isCancel(error)) {
//           toast.error("Route request timed out.");
//         } else if (error.response?.status === 500) {
//           toast.error("OSRM server error. Please try again later.");
//         } else {
//           toast.error("Failed to load route.");
//         }
//       } finally {
//         setRouteLoading(false);
//       }
//     };
//     fetchRoute();
//   }, [userLocation, selectedStop]);

//   const getNearbyBuses = () => {
//     if (
//       !selectedStop ||
//       !selectedStop.location ||
//       !Array.isArray(selectedStop.location.coordinates) ||
//       selectedStop.location.coordinates.length < 2
//     ) {
//       return [];
//     }
//     const [stopLng, stopLat] = selectedStop.location.coordinates;
//     return buses
//       .filter((bus) => bus.currentLocation)
//       .map((bus) => {
//         const distance = getDistanceFromLatLonInKm(
//           stopLat,
//           stopLng,
//           bus.currentLocation.latitude,
//           bus.currentLocation.longitude
//         );
//         return { ...bus, distance };
//       })
//       .filter((bus) => bus.distance < 2)
//       .sort((a, b) => a.distance - b.distance)
//       .slice(0, 3);
//   };

//   // This useEffect is now local and doesn't affect the parent
//   useEffect(() => {
//     if (selectedStop) {
//       localStorage.setItem("selectedStop", JSON.stringify(selectedStop));
//     }
//   }, [selectedStop]);

//   return (
//     <div id="map-container" className="h-full w-full z-0">
//       <PanToStop selectedStop={selectedStop} mapRef={mapRef} />
//       {selectedStop && (
//         <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md shadow-md rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
//           <div className="font-medium mb-1">
//             📍 {selectedStop.name || "Selected Stop"}
//           </div>
//           {routeLoading && (
//             <div className="flex items-center text-gray-500 mt-1">
//               <svg
//                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Calculating route...
//             </div>
//           )}
//           {userLocation && distanceToStop !== null && !routeLoading ? (
//             <div>
//               📏 Distance:{" "}
//               {distanceToStop > 1
//                 ? `${distanceToStop.toFixed(2)} km`
//                 : `${(distanceToStop * 1000).toFixed(0)} m`}
//             </div>
//           ) : (
//             <div className="text-red-600">🚫 Enable location to get distance</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



// MapComponent.jsx
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import SearchBar from "../components/Navbar/SearchBar"; // <-- make sure path is correct

// 🚌 Custom Bus Icon
const busIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;utf8,
    <svg xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="green" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" 
      class="lucide lucide-bus-front">
        <path d="M4 6 2 7"/>
        <path d="M10 6h4"/>
        <path d="m22 7-2-1"/>
        <rect width="16" height="16" x="4" y="3" rx="2"/>
        <path d="M4 11h16"/>
        <path d="M8 15h.01"/>
        <path d="M16 15h.01"/>
        <path d="M6 19v2"/>
        <path d="M18 21v-2"/>
    </svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// 👤 Custom User Location Icon
const userLocationIcon = L.divIcon({
  className: "user-location-icon",
  html: `<div class="relative flex items-center justify-center w-5 h-5">
            <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
            <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
          </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/** Helper: robustly extract lat/lng from various stop shapes */
function extractStopLatLng(stop) {
  if (!stop) return null;

  // 1) location.coordinates = [lng, lat]
  const coords = stop?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    if (typeof lat === "number" && typeof lng === "number") return { lat, lng };
  }

  // 2) location.latitude/longitude
  const latA = stop?.location?.latitude;
  const lngA = stop?.location?.longitude;
  if (typeof latA === "number" && typeof lngA === "number") {
    return { lat: latA, lng: lngA };
  }

  // 3) top-level lat/lng or lat/lon
  const latB = stop?.lat ?? stop?.latitude;
  const lngB = stop?.lng ?? stop?.lon ?? stop?.longitude;
  if (typeof latB === "number" && typeof lngB === "number") {
    return { lat: latB, lng: lngB };
  }

  return null;
}

// 🗺️ Center map on selected stop
function PanToStop({ selectedStop, mapRef }) {
  useEffect(() => {
    if (!mapRef.current || !selectedStop) return;
    const map = mapRef.current;

    // Original logic (kept)
    const coords = selectedStop?.location?.coordinates;
    const lat = selectedStop?.location?.latitude;
    const lng = selectedStop?.location?.longitude;

    if (Array.isArray(coords) && coords.length === 2) {
      const [lngCoord, latCoord] = coords;
      map.flyTo([latCoord, lngCoord], 16, { animate: true });
      return;
    } else if (typeof lat === "number" && typeof lng === "number") {
      map.flyTo([lat, lng], 16, { animate: true });
      return;
    }

    // Fallback for search-provided shapes
    const parsed = extractStopLatLng(selectedStop);
    if (parsed) {
      map.flyTo([parsed.lat, parsed.lng], 16, { animate: true });
    }
  }, [selectedStop, mapRef]);

  return null;
}

// 🔍 Distance in KM between two lat/lng points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🕒 Estimate ETA (minutes) given distance and speed (20 km/h default)
function getETA(distanceKm, speedKmh = 20) {
  return Math.ceil((distanceKm / speedKmh) * 60);
}

// 🧭 Determines bus direction based on distance comparison
function getDirection(currentDistance, previousDistance) {
  if (previousDistance === null || previousDistance === currentDistance) {
    return "stopped";
  }
  return currentDistance < previousDistance ? "approaching" : "moving away";
}

// MapComponent now accepts props
export default function MapComponent({ selectedStop: selectedStopProp, setSelectedStop: setSelectedStopProp }) {
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceToStop, setDistanceToStop] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [nearestStopForUser, setNearestStopForUser] = useState(null);

  // If parent didn't provide selectedStop/setSelectedStop, fall back to internal state.
  const [internalSelectedStop, setInternalSelectedStop] = useState(() => {
    try {
      const s = localStorage.getItem("selectedStop");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const selectedStop = selectedStopProp ?? internalSelectedStop;
  const setSelectedStop = (stop) => {
    if (typeof setSelectedStopProp === "function") {
      setSelectedStopProp(stop);
    } else {
      setInternalSelectedStop(stop);
    }
  };

  const mapRef = useRef(null);
  const busMarkersRef = useRef({});
  const stopMarkersRef = useRef({});
  const polylineRef = useRef(null);
  const lastPlottedRouteRef = useRef(null);
  const busTrackingRef = useRef({});

  // Effect for initial map setup and cleanup
  useEffect(() => {
    const map = L.map("map-container").setView([30.1775, 66.9900], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    mapRef.current = map;

    // Clean up the map instance when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run only once

  // Effect for fetching initial data (buses and stops) and handling the socket
  useEffect(() => {
    // This part now handles fetching both via API and socket
    const fetchData = async () => {
      try {
        const [busRes, stopRes] = await Promise.all([
          axios.get("/api/buses/public"),
          axios.get("/api/stops/public"),
        ]);
        setBuses(busRes.data);
        setStops(stopRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Socket.IO Connection Logic
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
      // 1. Send event to request current bus data immediately upon connection
      socket.emit("requestInitialBusData");
    });

    // 2. Listen for the initial bus data from the server
    socket.on("initialBusData", (initialBuses) => {
      console.log("📥 Received initial bus data:", initialBuses);
      setBuses(initialBuses);
    });

    socket.on("busLocationUpdate", ({ driverId, busId, latitude, longitude }) => {
      console.log("📡 Location update:", { driverId, busId, latitude, longitude });

      setBuses((prev) => {
        const existing = prev.find((b) => b._id === busId);
        if (existing) {
          // Update existing bus
          return prev.map((bus) =>
            bus._id === busId
              ? { ...bus, currentLocation: { latitude, longitude } }
              : bus
          );
        } else {
          // Create new bus if not found
          return [
            ...prev,
            {
              _id: busId,
              number: `Bus ${busId.slice(-4)}`, // fallback label
              driver: { _id: driverId },
              currentLocation: { latitude, longitude },
            },
          ];
        }
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Effect for fetching user location and finding the nearest stop
  useEffect(() => {
    if ("geolocation" in navigator) {
      const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

      const geoSuccess = (pos) => {
        const userLoc = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(userLoc);

        if (stops.length > 0) {
          let closestStop = null;
          let minDistance = Infinity;

          stops.forEach((stop) => {
            if (stop.location) {
              const distance = getDistanceFromLatLonInKm(
                userLoc.latitude,
                userLoc.longitude,
                stop.location.latitude,
                stop.location.longitude
              );
              if (distance < minDistance) {
                minDistance = distance;
                closestStop = stop;
              }
            }
          });
          setNearestStopForUser(closestStop);
        }
      };

      const geoError = (err) => console.warn("Geolocation error:", err.message);

      // Start watching the user's location for continuous updates
      const watchId = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);

      // Cleanup function to stop watching when the component unmounts
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [stops]);

  // Effect for updating map markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 🚍 Update/Add Bus Markers
    const existingBusIds = new Set(buses.map(bus => bus._id));

    // Remove markers for buses that are no longer in the state
    Object.keys(busMarkersRef.current).forEach(busId => {
      if (!existingBusIds.has(busId)) {
        try {
          busMarkersRef.current[busId].remove();
        } catch {}
        delete busMarkersRef.current[busId];
      }
    });

    buses.forEach((bus) => {
      if (bus.currentLocation) {
        const latlng = [
          bus.currentLocation.latitude,
          bus.currentLocation.longitude,
        ];

        let popupContent = `<strong>Bus #${bus.number}</strong><br/>`;

        if (nearestStopForUser && nearestStopForUser.location) {
          const busDistanceToStop = getDistanceFromLatLonInKm(
            bus.currentLocation.latitude,
            bus.currentLocation.longitude,
            nearestStopForUser.location.latitude,
            nearestStopForUser.location.longitude
          );
          const eta = getETA(busDistanceToStop);

          // Correctly retrieve and store previous and current distances
          const previousDistance = busTrackingRef.current[bus._id]?.currentDistance;
          const direction = getDirection(busDistanceToStop, previousDistance);

          if (!busTrackingRef.current[bus._id]) {
            busTrackingRef.current[bus._id] = { previousDistance: null };
          }
          busTrackingRef.current[bus._id].currentDistance = busDistanceToStop;

          popupContent += `
            <strong><br/>To nearest stop: ${nearestStopForUser.name}</strong><br/>
            📏 Distance: ${busDistanceToStop.toFixed(2)} km<br/>
            🕒 ETA: ${eta} min<br/>
            🧭 Direction: ${direction === 'approaching' ? 'Approaching' : direction === 'moving away' ? 'Moving Away' : 'Stopped'}
          `;
        } else {
          popupContent += `<br/>Waiting for user location to find nearest stop...`;
        }

        if (busMarkersRef.current[bus._id]) {
          busMarkersRef.current[bus._id].setLatLng(latlng);
          busMarkersRef.current[bus._id].setPopupContent(popupContent);
        } else {
          const marker = L.marker(latlng, { icon: busIcon }).addTo(map);
          marker.bindPopup(popupContent);
          busMarkersRef.current[bus._id] = marker;
        }
      } else {
        if (busMarkersRef.current[bus._id]) {
          busMarkersRef.current[bus._id].remove();
          delete busMarkersRef.current[bus._id];
        }
      }
    });

    // 👤 User marker
    if (busMarkersRef.current['user']) {
      busMarkersRef.current['user'].remove();
      delete busMarkersRef.current['user'];
    }
    if (userLocation) {
      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], { icon: userLocationIcon }).addTo(map);
      busMarkersRef.current['user'] = userMarker;
    }

    // 🚏 Update/Add Stop Markers
    Object.values(stopMarkersRef.current).forEach(marker => marker.remove());
    stopMarkersRef.current = {};
    stops.forEach(stop => {
      if (stop.location) {
        const marker = L.marker([stop.location.latitude, stop.location.longitude]).addTo(map);
        marker.bindPopup(`<strong>${stop.name}</strong>`);
        marker.on('click', () => setSelectedStop(stop));
        stopMarkersRef.current[stop._id] = marker;
      }
    });

    // 🚍 Update Nearby Bus Markers
    const nearbyBuses = getNearbyBuses();
    Object.keys(busMarkersRef.current).filter(key => key.startsWith('nearby-')).forEach(key => {
      try { busMarkersRef.current[key].remove(); } catch {}
      delete busMarkersRef.current[key];
    });

    nearbyBuses.forEach((bus, idx) => {
      const eta = getETA(bus.distance);
      let directionIndicator = "";
      const previousDistance = busTrackingRef.current[bus._id]?.previousDistance;
      const direction = getDirection(bus.distance, previousDistance);

      if (direction === "approaching") {
        directionIndicator = "➡️";
      } else if (direction === "moving away") {
        directionIndicator = "⬅️";
      }

      const icon = L.divIcon({
        className: "nearby-bus-icon",
        html: `<div style="background:#facc15;padding:4px 8px;border-radius:6px;font-size:12px;">
           🚍 ${bus.distance.toFixed(1)} km, ETA ${eta} min ${directionIndicator}
        </div>`,
      });
      const marker = L.marker([bus.currentLocation.latitude, bus.currentLocation.longitude], { icon: icon }).addTo(map);
      busMarkersRef.current[`nearby-${bus._id}-${idx}`] = marker;
    });

  }, [buses, stops, userLocation, selectedStop, nearestStopForUser]);

  // Effect for calculating distance to stop
  useEffect(() => {
    if (!selectedStop || !userLocation) {
      setDistanceToStop(null);
      return;
    }

    let stopLat, stopLng;
    if (
      selectedStop?.location?.coordinates &&
      Array.isArray(selectedStop.location.coordinates) &&
      selectedStop.location.coordinates.length === 2
    ) {
      [stopLng, stopLat] = selectedStop.location.coordinates;
    } else if (
      typeof selectedStop?.location?.latitude === "number" &&
      typeof selectedStop?.location?.longitude === "number"
    ) {
      stopLat = selectedStop.location.latitude;
      stopLng = selectedStop.location.longitude;
    } else {
      // Fallback for SearchBar-provided shapes
      const parsed = extractStopLatLng(selectedStop);
      if (parsed) {
        stopLat = parsed.lat;
        stopLng = parsed.lng;
      } else {
        console.warn("❌ Invalid stop coordinates");
        setDistanceToStop(null);
        return;
      }
    }

    const dist = getDistanceFromLatLonInKm(
      userLocation.latitude,
      userLocation.longitude,
      stopLat,
      stopLng
    );

    setDistanceToStop(dist);
  }, [userLocation, selectedStop]);

  // Effect for plotting the route line
  useEffect(() => {
    if (!mapRef.current || !userLocation || !selectedStop) {
      if (polylineRef.current) {
        try { mapRef.current.removeLayer(polylineRef.current); } catch {}
        polylineRef.current = null;
      }
      return;
    }
    const currentRouteKey = `${userLocation.latitude},${userLocation.longitude}-${selectedStop._id}`;
    if (lastPlottedRouteRef.current === currentRouteKey) {
      return;
    }
    const fetchRoute = async () => {
      setRouteLoading(true);
      if (polylineRef.current) {
        try { mapRef.current.removeLayer(polylineRef.current); } catch {}
        polylineRef.current = null;
      }
      let stopLat, stopLng;
      if (
        selectedStop?.location?.coordinates &&
        Array.isArray(selectedStop.location.coordinates) &&
        selectedStop.location.coordinates.length === 2
      ) {
        [stopLng, stopLat] = selectedStop.location.coordinates;
      } else if (
        typeof selectedStop?.location?.latitude === "number" &&
        typeof selectedStop?.location?.longitude === "number"
      ) {
        stopLat = selectedStop.location.latitude;
        stopLng = selectedStop.location.longitude;
      } else {
        // Fallback for SearchBar-provided shapes
        const parsed = extractStopLatLng(selectedStop);
        if (parsed) {
          stopLat = parsed.lat;
          stopLng = parsed.lng;
        }
      }
      if (!stopLat || !stopLng) {
        setRouteLoading(false);
        return;
      }
      const coordinates = `${userLocation.longitude},${userLocation.latitude};${stopLng},${stopLat}`;
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
      try {
        const response = await axios.get(url, { timeout: 10000 });
        const route = response.data.routes[0];

        if (route && route.geometry && route.geometry.coordinates) {
          const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const polyline = L.polyline(latLngs, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
          }).addTo(mapRef.current);
          polylineRef.current = polyline;
          lastPlottedRouteRef.current = currentRouteKey;
        } else {
          toast.error("No route found between your location and the stop.");
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        if (axios.isCancel(error)) {
          toast.error("Route request timed out.");
        } else if (error.response?.status === 500) {
          toast.error("OSRM server error. Please try again later.");
        } else {
          toast.error("Failed to load route.");
        }
      } finally {
        setRouteLoading(false);
      }
    };
    fetchRoute();
  }, [userLocation, selectedStop]);

  const getNearbyBuses = () => {
    // Use the parsed coordinates when selectedStop might come from SearchBar
    const parsed = extractStopLatLng(selectedStop);
    if (!selectedStop || !parsed) return [];
    const stopLat = parsed.lat;
    const stopLng = parsed.lng;

    return buses
      .filter((bus) => bus.currentLocation)
      .map((bus) => {
        const distance = getDistanceFromLatLonInKm(
          stopLat,
          stopLng,
          bus.currentLocation.latitude,
          bus.currentLocation.longitude
        );
        return { ...bus, distance };
      })
      .filter((bus) => bus.distance < 2)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
  };

  // Persist selected stop locally if using internal state
  useEffect(() => {
    if (selectedStop) {
      try {
        localStorage.setItem("selectedStop", JSON.stringify(selectedStop));
      } catch {}
    }
  }, [selectedStop]);

  // Handler for SearchBar -> set the selected stop and pan the map
  const handleSearchSelectStop = (stop) => {
    if (!stop) return;
    setSelectedStop(stop);

    // try to pan immediately (best-effort)
    const parsed = extractStopLatLng(stop);
    if (mapRef.current && parsed) {
      try {
        mapRef.current.flyTo([parsed.lat, parsed.lng], 16, { animate: true });
      } catch {}
    }
  };

  return (
    <div id="map-container" className="h-full w-full z-0 relative">
      {/* SearchBar overlay */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1200, width: "min(720px, calc(100% - 48px))" }}>
        <SearchBar onSelectStop={handleSearchSelectStop} />
      </div>

      <PanToStop selectedStop={selectedStop} mapRef={mapRef} />

      {selectedStop && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-md shadow-md rounded-lg px-4 py-2 text-sm text-gray-800 max-w-xs">
          <div className="font-medium mb-1">
            📍 {selectedStop.name || "Selected Stop"}
          </div>
          {routeLoading && (
            <div className="flex items-center text-gray-500 mt-1">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating route...
            </div>
          )}
          {userLocation && distanceToStop !== null && !routeLoading ? (
            <div>
              📏 Distance:{" "}
              {distanceToStop > 1
                ? `${distanceToStop.toFixed(2)} km`
                : `${(distanceToStop * 1000).toFixed(0)} m`}
            </div>
          ) : (
            <div className="text-red-600">
              🚫 Enable location to get distance
            </div>
          )}
        </div>
      )}
    </div>
  );
}
