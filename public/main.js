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
let visiblePlaceCount = 3;
const PLACE_PAGE_SIZE = 3;

let map = null;
let userMarker = null;
let placeMarkers = [];
let lastMapPosition = null;

let user_position = null;

document.addEventListener("DOMContentLoaded", () => {
  const weights = loadWeights();
  applyWeightsToInputs(weights);

  const recommendButton = document.getElementById("recommend-button");

  if (recommendButton) {
    recommendButton.addEventListener("click", handleRecommend);
    console.log(readWeightsFromInputs());
  }

  ensureLoadMoreButton();

  setStatus("위치 정보를 불러올 준비가 되었습니다.");
});

async function handleRecommend() {
  try {
    setStatus("현재 위치를 확인하는 중입니다.");

    const position = await getMap();
    user_position = position;
    const weights = readWeightsFromInputs();
    const placeType = document.getElementById("place-type").value;

    saveWeights(weights);

    if (position.fallback) {
      setStatus("위치 권한을 사용할 수 없어 동대문역사문화공원역 기준으로 추천합니다.");
    } else {
      setStatus("서버에서 추천 장소를 계산하는 중입니다.");
    }

    const data = await requestRecommendation(position, weights, placeType);

    currentPlaces = Array.isArray(data.places) ? data.places : [];
    visiblePlaceCount = PLACE_PAGE_SIZE;

    if (currentPlaces.length === 0) {
      renderVisiblePlaces();
      updateLoadMoreButton();
      clearPlaceMarkers();
      setStatus("추천 가능한 장소가 없습니다.");
      return;
    }

    renderVisiblePlaces();

    const firstPlace = currentPlaces[0];

    if (firstPlace.congestionTrend) {
      renderCongestionChart(firstPlace.congestionTrend);
    }

    renderPlaceNetwork(getVisiblePlaces(), position, handlePlaceSelect);
    renderPlaceMarkers(getVisiblePlaces());

    setStatus(`추천이 완료되었습니다. 총 ${currentPlaces.length}개의 장소를 찾았습니다.`);
  } catch (error) {
    console.error(error);
    setStatus("추천 정보를 불러오지 못했습니다.");
  }
}

async function handlePlaceSelect(place) {
  if (place.congestionTrend) {
    renderCongestionChart(place.congestionTrend);
  }

  try {
    const weights = readWeightsFromInputs();
    const result = await sendFeedback(place, weights);

    if (result && result.weights) {
      saveWeights(result.weights);
      applyWeightsToInputs(result.weights);
    }

    focusPlaceOnMap(place);
    setStatus(`${place.name} 선택이 반영되었습니다.`);
  } catch (error) {
    console.error(error);
    setStatus("장소 선택은 되었지만 가중치 반영에 실패했습니다.");
  }
}

function getVisiblePlaces() {
  return currentPlaces.slice(0, visiblePlaceCount);
}

function renderVisiblePlaces() {
  const visiblePlaces = getVisiblePlaces();

  renderPlaces(visiblePlaces, handlePlaceSelect);
  updateLoadMoreButton();
}

function handleLoadMore() {
  visiblePlaceCount += PLACE_PAGE_SIZE;

  if (visiblePlaceCount > currentPlaces.length) {
    visiblePlaceCount = currentPlaces.length;
  }

  const visiblePlaces = getVisiblePlaces();

  renderPlaces(visiblePlaces, handlePlaceSelect);
  renderPlaceNetwork(visiblePlaces, user_position, handlePlaceSelect);
  renderPlaceMarkers(visiblePlaces);
  updateLoadMoreButton();

  setStatus(`${visiblePlaces.length}/${currentPlaces.length}개의 추천 장소를 표시 중입니다.`);
}

function ensureLoadMoreButton() {
  let loadMoreButton = document.getElementById("load-more-button");

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", handleLoadMore);
    updateLoadMoreButton();
    return;
  }

  const placeList = document.getElementById("place-list");

  if (!placeList || !placeList.parentElement) {
    return;
  }

  loadMoreButton = document.createElement("button");
  loadMoreButton.id = "load-more-button";
  loadMoreButton.type = "button";
  loadMoreButton.hidden = true;
  loadMoreButton.textContent = "더보기";
  loadMoreButton.addEventListener("click", handleLoadMore);

  placeList.parentElement.appendChild(loadMoreButton);
}

function updateLoadMoreButton() {
  const loadMoreButton = document.getElementById("load-more-button");

  if (!loadMoreButton) {
    return;
  }

  if (!currentPlaces || currentPlaces.length <= visiblePlaceCount) {
    loadMoreButton.hidden = true;
    return;
  }

  loadMoreButton.hidden = false;
  loadMoreButton.textContent = `더보기 (${visiblePlaceCount}/${currentPlaces.length})`;
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
    fallback: position.fallback
  };

  //console.log("Current map position:", mapData);

  const mapElement = document.getElementById("map");

  if (!mapElement || typeof L === "undefined") {
    return mapData;
  }

  if (!map) {
    map = L.map("map").setView([mapData.latitude, mapData.longitude], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
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

  clearPlaceMarkers();

  places.forEach((place, index) => {
    const latitude = place.latitude;
    const longitude = place.longitude;

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.warn(`좌표가 없어 마커를 표시하지 않음: ${place.KOR_NM}`);
      return;
    }

    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`
        <strong>${index + 1}위. ${place.name}</strong><br />
        유형: ${place.category}<br />
        혼잡도: ${place.crowdLevel}<br />
        쉼표 지수: ${Math.round(place.restScore)}
      `);

    placeMarkers.push(marker);
  });
}


function clearPlaceMarkers() {
  placeMarkers.forEach((marker) => marker.remove());
  placeMarkers = [];
}


function focusPlaceOnMap(place) {
  if (!map || typeof L === "undefined") {
    return;
  }

  const latitude = place.latitude;
  const longitude = place.longitude;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return;
  }

  map.setView([latitude, longitude], 16);

  const matchedMarker = placeMarkers.find((marker) => {
    const markerPosition = marker.getLatLng();

    return (
      Math.abs(markerPosition.lat - latitude) < 0.000001 &&
      Math.abs(markerPosition.lng - longitude) < 0.000001
    );
  });

  if (matchedMarker) {
    matchedMarker.openPopup();
  }
}