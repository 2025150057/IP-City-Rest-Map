export function setStatus(message) {
  document.getElementById("status-message").textContent = message;
}

export function renderPlaces(places, onSelect) {
  const list = document.getElementById("place-list");
  list.innerHTML = "";

  places.forEach((place, index) => {
    const card = document.createElement("article");
    card.className = "place-card";
    card.dataset.placeId = place.id;

    card.innerHTML = `
      <h3>${index + 1}위. ${place.name}</h3>
      <p>유형: ${place.category}</p>
      <p>거리: ${place.distance}m</p>
      <p>혼잡도: ${place.crowdLevel}</p>
      <p>대기질: PM10 ${place.pm10}, PM2.5 ${place.pm25}</p>
      <p>쉼표 지수: ${place.restScore}</p>
      <p>${place.reason}</p>
      <button type="button">이 장소 선택</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      document.querySelectorAll(".place-card").forEach((item) => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");
      onSelect(place);
    });

    list.appendChild(card);
  });
}