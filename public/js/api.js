import { mockRecommendation } from "./mockData.js";

const USE_MOCK = false;

export async function requestRecommendation(position, weights, placeType) {

  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      position,
      weights,
      placeType: getPlaceType(placeType),
      count: Infinity,
      page: 1
    })
  });

  if (!response.ok) {
    throw new Error("추천 요청 실패");
  }

  return response.json();
}

export async function sendFeedback(selectedPlace, weights) {
  if (USE_MOCK) {
    return { weights };
  }

  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      selectedPlace,
      weights
    })
  });

  if (!response.ok) {
    throw new Error("피드백 전송 실패");
  }

  return response.json();
}


/**
 * @abstract change place type name to korean, so that kakao api can handle.
 * @param {*} placeTypeName 
 * @returns 
 */
function getPlaceType(placeTypeName) {
  if (placeTypeName === "전체") {
    return ["산책", "카페", "공원"];
  }
  else if (placeTypeName === "walk") {
    return ["산책"];
  }
  else if (placeTypeName === "cafe") {
    return ["카페"];
  }
  else if (placeTypeName === "park") {
    return ["공원"];
  }
  else {
    return ["산책", "카페", "공원"];
  }
}

