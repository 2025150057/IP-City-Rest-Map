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
let map = null;
let userMarker = null;
let placeMarkers = [];
let lastMapPosition = null;

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

    const position = await getMap();
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
    renderPlaceMarkers(currentPlaces);

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
    const result = await sendFeedback(place, weights);

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

async function getMap() {
  const position = await getCurrentLocation();

  const mapData = {
    latitude: position.latitude,
    longitude: position.longitude,
    fallback: position.fallback,
  };

  console.log("Current map position:", mapData);

  const mapElement = document.getElementById("map");

  if (!mapElement || typeof L === "undefined") {
    return mapData;
  }

  if (!map) {
    map = L.map("map").setView([mapData.latitude, mapData.longitude], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  } else {
    map.setView([mapData.latitude, mapData.longitude], 15);
  }

  if (userMarker) {
    userMarker.setLatLng([mapData.latitude, mapData.longitude]);
  } else {
    userMarker = L.marker([mapData.latitude, mapData.longitude])
      .addTo(map)
      .bindPopup("현재 위치");
  }

  userMarker.openPopup();

  lastMapPosition = mapData;

  return mapData;
}

function renderPlaceMarkers(places) {
  if (!map || typeof L === "undefined") {
    return;
  }

  placeMarkers.forEach((marker) => marker.remove());
  placeMarkers = [];

  places.forEach((place, index) => {
    const latitude = Number(place.latitude ?? place.LATITUDE ?? place.lat);
    const longitude = Number(place.longitude ?? place.LONGITUDE ?? place.lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.warn(`좌표가 없어 마커를 표시하지 않음: ${place.name ?? place.KOR_NM}`);
      return;
    }

    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`
        <strong>${index + 1}위. ${place.name ?? place.KOR_NM}</strong><br />
        유형: ${place.category ?? place.CATEGORY ?? "정보 없음"}<br />
        혼잡도: ${place.crowdLevel ?? place.density ?? "정보 없음"}<br />
        쉼표 지수: ${place.restScore ?? "계산 전"}
      `);

    placeMarkers.push(marker);
  });
}
