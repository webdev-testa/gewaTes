// Initialize and add the map
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

    // Default center (Jakarta)
    const jakarta = { lat: -6.2088, lng: 106.8456 };

    console.log("Initializing Map..."); // Debug Log

    const map = new Map(document.getElementById("map"), {
        zoom: 13,
        center: jakarta,
        mapId: "DEMO_MAP_ID", 
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
    });

    // Create the Place Autocomplete Element
    const autocomplete = new PlaceAutocompleteElement({
        componentRestrictions: { country: "id" } // Limit to Indonesia
    });
    
    // Append to the external container to ensure events fire correctly
    const container = document.getElementById("autocomplete-container");
    if (container) {
        container.appendChild(autocomplete);
    } else {
        console.error("Autocomplete container not found!");
    }
    
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(autocomplete); // REMOVED

    // Initial Marker
    const marker = new AdvancedMarkerElement({
        map: map,
        position: jakarta,
        gmpDraggable: true, 
        title: "Drag me!"
    });

    // Listener for when user selects a place
    autocomplete.addEventListener("gmp-placeselect", async (event) => {
        const place = event.place;
        console.log("Place Selected Event Fired!", place);

        try {
            // We need to fetch the fields we want
            await place.fetchFields({ fields: ["displayName", "formattedAddress", "location", "viewport"] });

            console.log("Place Fields Fetched:", {
                address: place.formattedAddress,
                location: place.location,
                viewport: place.viewport
            });

            if (!place.location) {
                window.alert("No location details available for input: '" + place.displayName + "'");
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

        } catch (error) {
            console.error("Error fetching place details:", error);
            window.alert("Error getting place details: " + error.message);
        }
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
