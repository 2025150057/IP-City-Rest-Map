import {
  loadWeights,
  saveWeights,
  readWeightsFromInputs,
  applyWeightsToInputs
} from "./js/storage.js";

import { getCurrentLocation } from "./js/location.js";
import { requestRecommendation, sendFeedback } from "./js/api.js";
import { setStatus, renderPlaces } from "./js/render.js";
import { renderCongestionChart } from "./js/chart.js";
import { renderPlaceNetwork } from "./js/network.js";

let currentPlaces = [];

document.addEventListener("DOMContentLoaded", () => {
  const weights = loadWeights();
  applyWeightsToInputs(weights);

  document
    .getElementById("recommend-button")
    .addEventListener("click", handleRecommend);
});

async function handleRecommend() {
  try {
    setStatus("현재 위치를 확인하는 중입니다.");

    const position = await getCurrentLocation();
    const weights = readWeightsFromInputs();
    const placeType = document.getElementById("place-type").value;

    saveWeights(weights);

    if (position.fallback) {
      setStatus("위치 권한을 사용할 수 없어 동대문역사문화공원역 기준으로 추천합니다.");
    } else {
      setStatus("서버에서 추천 장소를 계산하는 중입니다.");
    }

    const data = await requestRecommendation(position, weights, placeType);
    currentPlaces = data.places;

    renderPlaces(currentPlaces, handlePlaceSelect);
    renderCongestionChart(currentPlaces[0].congestionTrend);
    renderPlaceNetwork(currentPlaces, handlePlaceSelect);

    setStatus("추천이 완료되었습니다.");
  } catch (error) {
    console.error(error);
    setStatus("추천 정보를 불러오지 못했습니다.");
  }
}

async function handlePlaceSelect(place) {
  renderCongestionChart(place.congestionTrend);

  try {
    const weights = readWeightsFromInputs();
    const result = await sendFeedback(place.id, weights);

    if (result.weights) {
      saveWeights(result.weights);
      applyWeightsToInputs(result.weights);
    }

    setStatus(`${place.name} 선택이 반영되었습니다.`);
  } catch (error) {
    console.error(error);
    setStatus("장소 선택은 되었지만 가중치 반영에 실패했습니다.");
  }
}