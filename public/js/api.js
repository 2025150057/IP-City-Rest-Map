import { mockRecommendation } from "./mockData.js";

const USE_MOCK = false;

export async function requestRecommendation(position, weights, placeType) {
  if (USE_MOCK) {
    return mockRecommendation;
  }


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
      weights: weights,
      placeType: normalizePlaceTypes(placeType)
    })//applied 2.
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
