/* global globalThis */
const {db} = require("../../shared/config/firebase");
const {addRouteService} = require("./route.service");
const {addTripService} = require("../trip/trip.service");
const {bookTripService} = require("../user/user.service");

const fetchPlaceFromGoogleGeocoding = async (nameVal) => {
  const apiKey = "AIzaSyDd3W4SQ3Ua0WZ6fjuFeOQdPSqxq7wuCXA";
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(nameVal)}&key=${apiKey}`;
    const response = await globalThis.fetch(url);
    if (!response.ok) {
      console.error(`Google Geocoding API request failed with status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        name: nameVal,
        place_id: result.place_id,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    } else {
      console.warn(`Google Geocoding API returned status: ${data.status} for address: ${nameVal}`);
    }
  } catch (error) {
    console.error("Error calling Google Geocoding API:", error);
  }
  return null;
};

const getPlaceDetails = async (locationInput) => {
  if (locationInput && typeof locationInput === "object") {
    const nameVal = locationInput.name || "";
    const placeIdVal = locationInput.place_id || locationInput.placeId || "place_" + Date.now();
    const latVal = locationInput.lat !== undefined ? Number(locationInput.lat) : (locationInput.latitude !== undefined ? Number(locationInput.latitude) : 52.0);
    const lngVal = locationInput.lng !== undefined ? Number(locationInput.lng) : (locationInput.long !== undefined ? Number(locationInput.long) : (locationInput.longitude !== undefined ? Number(locationInput.longitude) : -1.5));
    const formattedAddressVal = locationInput.formatted_address || locationInput.address || `${nameVal}, UK`;

    // Check if this place already exists in the "places" collection
    let exists = false;
    if (placeIdVal && !placeIdVal.startsWith("place_")) {
      try {
        const placeDoc = await db.collection("places").doc(placeIdVal).get();
        if (placeDoc.exists) {
          exists = true;
        }
      } catch (err) {
        console.error("Error checking place doc existence:", err);
      }
    }

    if (!exists && nameVal.trim()) {
      try {
        const placeQuery = await db.collection("places")
          .where("searchKey", "==", nameVal.trim().toLowerCase())
          .limit(1)
          .get();
        if (!placeQuery.empty) {
          exists = true;
        }
      } catch (err) {
        console.error("Error checking place by searchKey:", err);
      }
    }

    // If it doesn't exist, write/create it!
    if (!exists && nameVal.trim()) {
      try {
        await db.collection("places").doc(placeIdVal).set({
          name: nameVal,
          place_id: placeIdVal,
          lat: latVal,
          lng: lngVal,
          formatted_address: formattedAddressVal,
          searchKey: nameVal.trim().toLowerCase(),
          updatedAt: new Date(),
        }, {merge: true});
      } catch (err) {
        console.error("Error storing place in places collection:", err);
      }
    }

    return {
      name: nameVal,
      place_id: placeIdVal,
      lat: latVal,
      lng: lngVal,
      formatted_address: formattedAddressVal,
    };
  }

  if (typeof locationInput === "string" && locationInput.trim()) {
    const nameVal = locationInput.trim();
    try {
      const placeQuery = await db.collection("places")
        .where("searchKey", "==", nameVal.toLowerCase())
        .limit(1)
        .get();

      if (!placeQuery.empty) {
        const placeData = placeQuery.docs[0].data();
        return {
          name: nameVal,
          place_id: placeQuery.docs[0].id || placeData.place_id || "place_" + Date.now(),
          lat: placeData.lat !== undefined ? Number(placeData.lat) : (placeData.latitude !== undefined ? Number(placeData.latitude) : 52.0),
          lng: placeData.lng !== undefined ? Number(placeData.lng) : (placeData.long !== undefined ? Number(placeData.long) : (placeData.longitude !== undefined ? Number(placeData.longitude) : -1.5)),
          formatted_address: placeData.formatted_address || `${nameVal}, UK`,
        };
      }
    } catch (err) {
      console.error("Error querying places collection by searchKey:", err);
    }

    try {
      const placeQueryByName = await db.collection("places")
        .where("name", "==", nameVal)
        .limit(1)
        .get();

      if (!placeQueryByName.empty) {
        const placeData = placeQueryByName.docs[0].data();
        return {
          name: nameVal,
          place_id: placeQueryByName.docs[0].id || placeData.place_id || "place_" + Date.now(),
          lat: placeData.lat !== undefined ? Number(placeData.lat) : (placeData.latitude !== undefined ? Number(placeData.latitude) : 52.0),
          lng: placeData.lng !== undefined ? Number(placeData.lng) : (placeData.long !== undefined ? Number(placeData.long) : (placeData.longitude !== undefined ? Number(placeData.longitude) : -1.5)),
          formatted_address: placeData.formatted_address || `${nameVal}, UK`,
        };
      }
    } catch (err) {
      console.error("Error querying places collection by name:", err);
    }

    // Google Maps Geocoding API lookup
    const googleGeocode = await fetchPlaceFromGoogleGeocoding(nameVal);
    if (googleGeocode) {
      try {
        await db.collection("places").doc(googleGeocode.place_id).set({
          name: googleGeocode.name,
          place_id: googleGeocode.place_id,
          lat: googleGeocode.lat,
          lng: googleGeocode.lng,
          formatted_address: googleGeocode.formatted_address,
          searchKey: googleGeocode.name.toLowerCase(),
          updatedAt: new Date(),
        }, {merge: true});
      } catch (err) {
        console.error("Error storing geocoded place in places collection:", err);
      }
      return googleGeocode;
    }

    return {
      name: nameVal,
      place_id: "place_" + Date.now(),
      lat: 52.0,
      lng: -1.5,
      formatted_address: `${nameVal}, UK`,
    };
  }

  return null;
};

const processRouteRequestService = async (data, req) => {
  const {
    routeRequestId,
    fare,
    driverId,
    driverName,
    vehicleId,
    vehicleReg,
  } = data;

  const routeRequestDoc = await db.collection("route_request").doc(routeRequestId).get();
  if (!routeRequestDoc.exists) {
    return {success: false, error: "Route request not found"};
  }

  const routeRequestData = routeRequestDoc.data();
  const fromDetails = await getPlaceDetails(routeRequestData.from || routeRequestData.pickup);
  const toDetails = await getPlaceDetails(routeRequestData.to || routeRequestData.drop);

  if (!fromDetails || !toDetails) {
    return {success: false, error: "Missing origin or destination details in route request"};
  }

  const from = fromDetails.name;
  const to = toDetails.name;

  const normalizeDate = (d) => {
    if (!d) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return d;
    }
    const parts = d.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return d;
      }
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    const partsSlash = d.split("/");
    if (partsSlash.length === 3) {
      if (partsSlash[2].length === 4) {
        return `${partsSlash[2]}-${partsSlash[1].padStart(2, "0")}-${partsSlash[0].padStart(2, "0")}`;
      }
    }
    return d;
  };

  let rawRouteDates = [];
  if (routeRequestData.schedules) {
    rawRouteDates = routeRequestData.schedules.map((s) => s.date).filter(Boolean);
  }
  const routeDates = rawRouteDates.map(normalizeDate).filter(Boolean);

  let routeId = "";
  let routeName = "";

  // 1. Check if Route exists
  const routeQuery = await db.collection("routes")
    .where("startingPoint", "==", from)
    .where("endPoint", "==", to)
    .where("status", "==", "Active")
    .limit(1)
    .get();

  if (!routeQuery.empty) {
    const routeDoc = routeQuery.docs[0];
    routeId = routeDoc.id;
    routeName = routeDoc.data().name;
  } else {
    // Route doesn't exist, create it!
    const countSnapshot = await db.collection("routes").count().get();
    const routeOrder = countSnapshot.data().count + 1;

    const routePayload = {
      action: "add",
      name: `${from} - ${to}`,
      status: "Active",
      activationDate: new Date().toISOString(),
      deactivationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      description: "Auto-created from Route Request",
      selectedDates: routeDates,
      routes: [from, to],
      routesData: [
        {
          name: fromDetails.name,
          place_id: fromDetails.place_id,
          distanceFromStart: 0,
          formatted_address: fromDetails.formatted_address,
          lat: fromDetails.lat,
          lng: fromDetails.lng,
        },
        {
          name: toDetails.name,
          place_id: toDetails.place_id,
          distanceFromStart: 10,
          formatted_address: toDetails.formatted_address,
          lat: toDetails.lat,
          lng: toDetails.lng,
        },
      ],
      fareMatrix: {[`${from}-${to}`]: String(fare)},
      start: from,
      end: to,
      order: routeOrder,
    };

    const routeResult = await addRouteService(routePayload, req);
    if (!routeResult.success) {
      return {success: false, error: "Failed to create route: " + (routeResult.error || "unknown error")};
    }
    routeId = routeResult.id;
    routeName = routePayload.name;
  }

  // 2. Check if Trip exists
  const tripQuery = await db.collection("trips")
    .where("route_id", "==", routeId)
    .where("status", "==", "Active")
    .get();

  let tripId = "";
  for (const doc of tripQuery.docs) {
    const tripData = doc.data();
    const tripDates = tripData.selectedDates || [];
    const coversAll = routeDates.every((d) => tripDates.includes(d));
    if (coversAll) {
      tripId = doc.id;
      break;
    }
  }

  if (!tripId) {
    // Fetch route details to match exactly
    const routeDoc = await db.collection("routes").doc(routeId).get();
    const routeDocData = routeDoc.exists ? routeDoc.data() : {};
    const routeOrder = routeDocData.order || 1;
    const routeStops = routeDocData.routes || [from, to];
    const routeFareMatrix = routeDocData.fareMatrix || {[`${from}-${to}`]: String(fare)};
    const routePairs = routeDocData.routePairs || [`${from}-${to}`];

    const routeTiming = {};
    routeStops.forEach((stop, index) => {
      routeTiming[stop] = `08:${String(index * 15).padStart(2, "0")}`;
    });

    let seatingCapacity = 15;
    if (vehicleId) {
      try {
        const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
        if (vehicleDoc.exists) {
          seatingCapacity = Number(vehicleDoc.data().seatingCapacity || 15);
        }
      } catch (err) {
        console.error("Error fetching vehicle seatingCapacity:", err);
      }
    }

    // Trip doesn't exist, schedule it!
    const tripPayload = {
      type: "add",
      fields: {
        route_id: routeId,
        route_name: routeName,
        route_type: "core",
        routes: routeStops,
        routePairs: routePairs,
        routeTiming: routeTiming,
        selectedDates: routeDates,
        status: "Active",
        total_seats: seatingCapacity,
        available_seats: routeDates.reduce((acc, date) => {
          acc[date] = seatingCapacity;
          return acc;
        }, {}),
        driver_name: driverName,
        driver_id: driverId,
        vehicle_id: vehicleId,
        vehicle_reg: vehicleReg,
        fareMatrix: routeFareMatrix,
        order: routeOrder,
        notes: "Auto-scheduled trip from Route Request",
      },
    };

    const tripResult = await addTripService(tripPayload, req);
    if (!tripResult.success) {
      return {success: false, error: "Failed to create trip: " + (tripResult.error || "unknown error")};
    }

    const newTripQuery = await db.collection("trips")
      .where("route_id", "==", routeId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (newTripQuery.empty) {
      return {success: false, error: "Failed to retrieve the newly created trip"};
    }
    tripId = newTripQuery.docs[0].id;
  }

  // 3. Create booking
  const bookingPayload = {
    tripId: tripId,
    bookingCount: routeRequestData.passenger_count || 1,
    userId: routeRequestData.createdBy || routeRequestData.uid || "",
    paymentType: "offline",
    startingPoint: from,
    dropPoint: to,
    selectedDate: routeDates,
    passengers: [{name: routeRequestData.name || "Passenger", age: ""}],
    boardingPoint: {name: from},
    dropOffPoint: {name: to},
    multiBookings: false,
  };

  const bookingResult = await bookTripService(bookingPayload);
  if (!bookingResult.success) {
    return {success: false, error: "Failed to create booking: " + (bookingResult.message || "unknown error")};
  }

  // Send WhatsApp notification to the user that request is accepted and slot is booked
  try {
    const {sendUserRouteRequestAcceptedNotification} = require("../whatsapp/whatsapp.service");
    let bookingNo = "";
    if (bookingResult.data && bookingResult.data.id && bookingResult.data.id.length > 0) {
      const bookingId = bookingResult.data.id[0];
      const bookingDoc = await db.collection("bookings").doc(bookingId).get();
      if (bookingDoc.exists) {
        bookingNo = bookingDoc.data().bookingNo || "";
      }
    }
    await sendUserRouteRequestAcceptedNotification(routeRequestData, bookingNo);
  } catch (err) {
    console.error("Failed to send user route request accepted WhatsApp notification:", err);
  }

  // 4. Update route request status to Accepted
  await db.collection("route_request").doc(routeRequestId).update({
    status: "Accepted",
    updatedAt: new Date(),
  });

  return {
    status: 200,
    success: true,
    message: "Route request accepted and processed successfully",
  };
};

module.exports = {
  processRouteRequestService,
};
