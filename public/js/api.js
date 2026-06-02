import { mockRecommendation } from "./mockData.js";

const USE_MOCK = true;

export async function requestRecommendation(position, weights, placeType) {
  if (USE_MOCK) {
    return mockRecommendation;
  }

  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      position,
      weights,
      placeType
    })
  });

  if (!response.ok) {
    throw new Error("추천 요청 실패");
  }

  return response.json();
}

export async function sendFeedback(selectedPlaceId, weights) {
  if (USE_MOCK) {
    return { weights };
  }

  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      selectedPlaceId,
      weights
    })
  });

  if (!response.ok) {
    throw new Error("피드백 전송 실패");
  }

  return response.json();
}