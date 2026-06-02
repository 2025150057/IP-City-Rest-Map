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

  places.forEach((place, index) => {
    const angle = (Math.PI * 2 * index) / places.length;
    const radius = 2;

    graph.addNode(place.id, {
      label: place.name,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: Math.max(6, place.restScore / 8),
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