// Initialize and add the map
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

    // Default center (Jakarta)
    const jakarta = { lat: -6.2088, lng: 106.8456 };

    const map = new Map(document.getElementById("map"), {
        zoom: 13,
        center: jakarta,
        mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    // Create the Place Autocomplete Element
    const autocomplete = new PlaceAutocompleteElement({
        componentRestrictions: { country: "id" } // Limit to Indonesia
    });
    
    // Append it to our container div
    document.getElementById("autocomplete-container").appendChild(autocomplete);

    // Initial Marker
    const marker = new AdvancedMarkerElement({
        map: map,
        position: jakarta,
        gmpDraggable: true, // New property for draggable in AdvancedMarkerElement
        title: "Drag me!"
    });

    // Listener for when user selects a place
    autocomplete.addEventListener("gmp-placeselect", async ({ place }) => {
        // We need to fetch the fields we want (location is essential)
        await place.fetchFields({ fields: ["displayName", "formattedAddress", "location", "viewport"] });

        if (!place.location) {
            window.alert("No details available for input: '" + place.displayName + "'");
            return;
        }

        // Fit bounds or set center
        if (place.viewport) {
            map.fitBounds(place.viewport);
        } else {
            map.setCenter(place.location);
            map.setZoom(17);
        }

        // Move marker
        marker.position = place.location;

        console.log("Selected Place:", place.formattedAddress, place.location.toJSON());
    });

    // Listener for dragging the Advanced Marker
    marker.addListener("dragend", () => {
        // Accessing position is slightly different for AdvancedMarkerElement (it returns LatLng object directly usually)
        const position = marker.position; 
        console.log("New Pin Position:", position.toJSON());
    });
}

// Call initMap when the script loads (since we removed the callback from the script tag)
initMap();
