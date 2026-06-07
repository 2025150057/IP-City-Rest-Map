import Graph from "https://cdn.jsdelivr.net/npm/graphology@0.26.0/+esm";
import Sigma from "https://cdn.jsdelivr.net/npm/sigma@3.0.2/+esm";

let renderer = null;

export function renderPlaceNetwork(places, onSelect) {
  const container = document.getElementById("sigma-container");
  container.innerHTML = "";

  const graph = new Graph();

  graph.addNode("user", {
    label: "현재 위치",
    x: 0,
    y: 0,
    size: 12,
    color: "black"
  });

  let distance_based_places = [];
  let crowdedness_based_places = [];
  let air_based_places = [];
  let type_based_places = [];

  // set nodes has order. a vertex u, v exists if u is certainly better than v.
  places.forEach((place) => {
    let m = Math.max(place.subScores.distance, place.subScores.crowd, place.subScores.air, place.subScores.cafe, place.subScores.park, place.subScores.walk);
    if (m === place.subScores.distance) {
      distance_based_places.push(place);
    }
    else if (m === place.subScores.crowd) {
      crowdedness_based_places.push(place);
    }
    else if (m === place.subScores.air) {
      air_based_places.push(place);
    }
    else {
      type_based_places.push(place);
    }
  })
  const NUM_OF_SCORE_TYPES = 4

  places.forEach((place) => {
    const angle = (Math.PI * 2) / NUM_OF_SCORE_TYPES;
    const radius = 2;
    let direction = 0;
    if (distance_based_places.includes(place)) {
      direction = 0;
    }
    else if (crowdedness_based_places.includes(place)) {
      direction = 1;
    }
    else if (air_based_places.includes(place)) {
      direction = 2;
    }
    else {
      direction = 3;
    }

    graph.addNode(place.id, {
      label: place.name,
      x: Math.cos(angle * direction) * radius,
      y: Math.sin(angle * direction) * radius,
      size: Math.max(6, Math.pow(place.restScore, 1.2) / 8),
      color: getNodeColor(place),
      place
    });

    graph.addEdge("user", place.id);
  });

  renderer = new Sigma(graph, container);

  renderer.on("clickNode", (event) => {
    const node = graph.getNodeAttributes(event.node);

    if (node.place) {
      onSelect(node.place);
    }
  });
}

function getNodeColor(place) {
  if (place.restScore >= 85) {
    return "green";
  }

  if (place.restScore >= 75) {
    return "orange";
  }

  return "red";
}