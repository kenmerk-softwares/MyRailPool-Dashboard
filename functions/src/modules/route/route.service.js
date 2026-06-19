/* eslint-disable max-len */
const {adminLogs} = require("../../logs/logs.service");
const {db} = require("../../shared/config/firebase");

const addRouteService = async (data, req) => {
  const {
    action = "add",
    id,
    name,
    status,
    activationDate,
    deactivationDate,
    description,
    selectedDates,
    routes,
    routesData,
    fareMatrix,
    start,
    end,
  } = data;

  if (action === "add") {
    if (!name || !routes || routes.length < 2) {
      return {success: false, error: "Missing required fields or insufficient geographical nodes"};
    }

    // ====================== STORE PLACES DATA ====================== //
    if (routesData && Array.isArray(routesData)) {
      const batch = db.batch();
      routesData.forEach((place) => {
        if (place.place_id) {
          const placeData = {...place};
          delete placeData.distanceFromStart;
          const placeRef = db.collection("places").doc(place.place_id);
          batch.set(placeRef, {
            ...placeData,
            searchKey: place.name.toLowerCase(),
            updatedAt: new Date(),
          }, {merge: true});
        }
      });
      await batch.commit();
    }

    // ===================== CREATING PAIRS AND FARE MATRIX ===================== //
    const transformedFareMatrix = {};
    if (fareMatrix && typeof fareMatrix === "object") {
      Object.entries(fareMatrix).forEach(([key, value]) => {
        const parts = key.split("-");
        const [i, j] = parts.map(Number);
        if (!isNaN(i) && !isNaN(j) && routes[i] && routes[j]) {
          const pair = `${routes[i]}-${routes[j]}`;
          transformedFareMatrix[pair] = value;
        } else {
          transformedFareMatrix[key] = value;
        }
      });
    }
    const routePairs = Object.keys(transformedFareMatrix);
    // ===================== ADDING ROUTES ===================== //
    const countSnapshot = await db.collection("routes").count().get();
    const routeOrder = countSnapshot.data().count + 1;

    const payload = {
      name,
      order: routeOrder,
      status: "Inactive",
      activationDate: new Date(activationDate),
      deactivationDate: new Date(deactivationDate),
      description,
      selectedDates: selectedDates || [],
      routes,
      routesData,
      fareMatrix: transformedFareMatrix,
      startingPoint: start,
      endPoint: end,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.auth.uid,
      routePairs: routePairs,
    };

    const docRef = await db.collection("routes").add(payload);

    await adminLogs(req.auth.uid, req.auth.token.email, "Route Created", `Created travel corridor: ${name} (${start} to ${end})`);
    return {status: 200, success: true, id: docRef.id, message: "Route created successfully"};
  } else if (action === "edit") {
    if (!id) return {success: false, error: "Missing route ID"};

    const routeRef = db.collection("routes").doc(id);
    const currentDoc = await routeRef.get();

    if (!currentDoc.exists) {
      return {success: false, error: "Route not found"};
    }

    // ====================== STORE PLACES DATA ====================== //
    if (routesData && Array.isArray(routesData)) {
      const batch = db.batch();
      routesData.forEach((place) => {
        if (place.place_id) {
          const placeData = {...place};
          delete placeData.distanceFromStart;
          const placeRef = db.collection("places").doc(place.place_id);
          batch.set(placeRef, {
            ...placeData,
            searchKey: place.name.toLowerCase(),
            updatedAt: new Date(),
          }, {merge: true});
        }
      });
      await batch.commit();
    }

    // ====================== CREATING PAIRS AND FARE MATRIX ====================== //
    const transformedFareMatrix = {};
    if (fareMatrix && typeof fareMatrix === "object") {
      Object.entries(fareMatrix).forEach(([key, value]) => {
        const parts = key.split("-");
        const [i, j] = parts.map(Number);
        const rList = routes || currentDoc.data().routes;
        if (!isNaN(i) && !isNaN(j) && rList[i] && rList[j]) {
          const pair = `${rList[i]}-${rList[j]}`;
          transformedFareMatrix[pair] = value;
        } else {
          transformedFareMatrix[key] = value;
        }
      });
    }
    const routePairs = Object.keys(transformedFareMatrix);

    const payload = {
      name: name || currentDoc.data().name,
      status: status || currentDoc.data().status,
      activationDate: activationDate ? new Date(activationDate) : currentDoc.data().activationDate,
      deactivationDate: deactivationDate ? new Date(deactivationDate) : currentDoc.data().deactivationDate,
      description: description || currentDoc.data().description,
      selectedDates: selectedDates || currentDoc.data().selectedDates || [],
      routes: routes || currentDoc.data().routes,
      routesData: routesData || currentDoc.data().routesData,
      fareMatrix: Object.keys(transformedFareMatrix).length > 0 ? transformedFareMatrix : (fareMatrix || currentDoc.data().fareMatrix),
      startingPoint: start || currentDoc.data().startingPoint,
      endPoint: end || currentDoc.data().endPoint,
      updatedAt: new Date(),
      routePairs: routePairs.length > 0 ? routePairs : (currentDoc.data().routePairs || []),
    };

    await routeRef.update(payload);

    await adminLogs(req.auth.uid, req.auth.token.email, "Route Updated", `Updated travel corridor: ${name}`);
    return {status: 200, success: true, message: "Route updated successfully"};
  } else if (action === "delete") {
    if (!id) return {success: false, error: "Missing route ID"};

    await db.collection("routes").doc(id).delete();
    await adminLogs(req.auth.uid, req.auth.token.email, "Route Deleted", `Deleted travel corridor ID: ${id}`);
    return {status: 200, success: true, message: "Route deleted successfully"};
  } else {
    return {success: false, error: "Invalid action"};
  }
};

const routeRequestService = async (data, req) => {
  const {
    name,
    phone,
    from,
    to,
    schedules,
    passenger_count,
    share_intrest,
  } = data;

  let userName = name;
  let userPhone = phone;

  if (req.auth && req.auth.uid && (!userName || !userPhone)) {
    try {
      const userDoc = await db.collection("users").doc(req.auth.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (!userName) {
          userName = userData.name || userData.displayName || "";
        }
        if (!userPhone) {
          userPhone = userData.mobile || userData.phoneNumber || "";
        }
      }
    } catch (err) {
      console.error("Error fetching user details in routeRequestService:", err);
    }
  }

  const payload = {
    uid: req.auth ? req.auth.uid : "",
    name: userName || "",
    phone: userPhone || "",
    from: from || "",
    to: to || "",
    schedules: schedules || [],
    passenger_count: passenger_count !== undefined ? Number(passenger_count) : 1,
    share_intrest: share_intrest !== undefined ? share_intrest : false,
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: req.auth ? req.auth.uid : "system",
  };

  const docRef = await db.collection("route_request").add(payload);

  try {
    const {sendAdminRouteRequestNotification} = require("../whatsapp/whatsapp.service");
    await sendAdminRouteRequestNotification(payload);
  } catch (err) {
    console.error("Failed to send admin WhatsApp notification for route request:", err);
  }

  return {
    status: 200,
    success: true,
    id: docRef.id,
    message: "Route request submitted successfully",
  };
};

module.exports = {
  addRouteService,
  routeRequestService,
};

