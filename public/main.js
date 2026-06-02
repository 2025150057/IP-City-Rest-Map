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

  const recommendButton = document.getElementById("recommend-button");

  if (recommendButton) {
    recommendButton.addEventListener("click", handleRecommend);
  }

  setStatus("위치 정보를 불러올 준비가 되었습니다.");
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

    if (!currentPlaces || currentPlaces.length === 0) {
      setStatus("추천 가능한 장소가 없습니다.");
      return;
    }

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

/**
 * @abstract this function inputs places and returns a sorted array through weights.
 *
 * @param {Array} places - array of places.
 * @returns {Array} sorted array of places.
 */
function CalcPriorityThroughWeights(places) {
  // TODO: connect real priority calculation later.
  return places;
}

/**
 * @abstract get map data and apply it to html.
 *
 * @returns {Promise<null>}
 */
async function getMap() {
  // TODO: connect map data from server later.
  return null;
}

/**
 * @abstract get graph data.
 *
 * @returns {Promise<null>}
 */
async function getGraph() {
  // TODO: connect graph data from server later.
  return null;
}

/**
 * @abstract get weights data from local storage or input elements.
 *
 * @returns {Object} weights object.
 */
function getWeights() {
  return readWeightsFromInputs();
}

/**
 * @abstract select places according to weights.
 *
 * @param {Array} places - array of places.
 * @returns {Array} sorted array of places.
 */
function selectPlacesFromWeight(places) {
  // TODO: sort places by weights later.
  return places;
}

/**
 * @abstract update weights according to user's selected place.
 *
 * @param {Array} places - array of places.
 * @param {Object} selected - selected place.
 * @returns {null}
 */
function updateWeightsFromSelection(places, selected) {
  // TODO: update weights according to selected place later.
  return null;
}