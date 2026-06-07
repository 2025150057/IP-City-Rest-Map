import { mockRecommendation } from "./mockData.js";

const USE_MOCK = false;

export async function requestRecommendation(position, weights, placeType) {
  if (USE_MOCK) {
    return mockRecommendation;
  }

  const normalizedPlaceTypes = normalizePlaceTypes(placeType);
  const normalizedWeights = normalizeWeights(weights, placeType);

  const response = await fetch("/api/recommend/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      position: {
        latitude: position.latitude,
        longitude: position.longitude
      },
      latitude: position.latitude,
      longitude: position.longitude,
      lat: position.latitude,
      lng: position.longitude,
      weights: normalizedWeights,
      placeType: normalizedPlaceTypes
    })
  });

  if (!response.ok) {
    throw new Error("추천 요청 실패");
  }

  const data = await response.json();

  return normalizeRecommendationResponse(data);
}

export async function sendFeedback(selectedPlace, weights) {
  const selectedPlaceId =
    typeof selectedPlace === "string"
      ? selectedPlace
      : selectedPlace.id;

  try {
    const response = await fetch("/api/feedback/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        selectedPlaceId,
        selectedPlace,
        weights
      })
    });

    if (!response.ok) {
      return { weights };
    }

    return response.json();
  } catch (error) {
    console.warn("피드백 API를 사용할 수 없어 기존 가중치를 유지합니다.", error);
    return { weights };
  }
}

function normalizeRecommendationResponse(data) {
  if (Array.isArray(data)) {
    return { places: data };
  }

  if (data && Array.isArray(data.places)) {
    return data;
  }

  if (data && Array.isArray(data.data)) {
    return { places: data.data };
  }

  if (data && Array.isArray(data.result)) {
    return { places: data.result };
  }

  return { places: [] };
}

function normalizePlaceTypes(placeType) {
  if (Array.isArray(placeType)) {
    return placeType;
  }

  if (placeType === "cafe") {
    return ["카페"];
  }

  if (placeType === "park") {
    return ["공원"];
  }

  if (placeType === "walk") {
    return ["산책"];
  }

  return ["산책", "카페", "공원"];
}

function normalizeWeights(weights, placeType) {
  const safeWeights = weights || {};

  const distance = Number(safeWeights.distance ?? 0.3);
  const crowd = Number(safeWeights.crowd ?? 0.4);
  const air = Number(safeWeights.air ?? 0.2);
  const type = Number(safeWeights.type ?? 0.1);

  let cafe = 0;
  let park = 0;
  let walk = 0;

  if (placeType === "cafe") {
    cafe = type;
  } else if (placeType === "park") {
    park = type;
  } else if (placeType === "walk") {
    walk = type;
  } else {
    cafe = type / 3;
    park = type / 3;
    walk = type / 3;
  }

  return {
    distance,
    crowd,
    air,
    type,
    cafe,
    park,
    walk
  };
}