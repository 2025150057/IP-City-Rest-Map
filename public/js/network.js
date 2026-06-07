import Graph from "https://cdn.jsdelivr.net/npm/graphology@0.26.0/+esm";
import Sigma from "https://cdn.jsdelivr.net/npm/sigma@3.0.2/+esm";

let renderer = null;


export function renderPlaceNetwork(places, user_position, onSelect) {
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

  const max_rest_score = places[0]?.restScore || 100;
  const min_rest_score = places[-1]?.restScore || 0;

  //for i = 0; manually do it.

  function place0() {
    const dist = Math.log2(places[0].distance) * 2;

    const xdiff = places[0].latitude - user_position.latitude;
    const ydiff = places[0].longitude - user_position.longitude;

    const angle = Math.atan2(ydiff, xdiff);
    const x = dist * Math.cos(angle);
    const y = dist * Math.sin(angle);

    const size = Math.max(6, Math.pow(places[0].restScore, 1.2) / 8)

    graph.addNode(places[0].id, {
      label: places[0].name,
      x: x,
      y: y,
      size: size,
      color: getNodeColor(places[0].restScore, max_rest_score, min_rest_score),
      place: places[0],
      depth: 1
    });
    graph.addEdge("user", places[0].id);

  }

  place0();

  // set nodes has order. a vertex u, v exists if u is certainly better than v.
  for (let i = 1; i < places.length; i++) {
    const dist_from_i_to_user = Math.sqrt(Math.pow((places[i].latitude - user_position.latitude), 2) + Math.pow((places[i].longitude - user_position.longitude), 2));
    let smallest = dist_from_i_to_user;
    let smallest_node = -1;
    for (let j = i - 1; j >= 0; j -= 1) {
      //get smallest dist between i and other nodes.
      let dist = Math.pow((places[i].latitude - places[j].latitude), 2) + Math.pow((places[i].longitude - places[j].longitude), 2);
      dist = Math.sqrt(dist);
      if (dist < smallest) {
        smallest = dist;
        smallest_node = j;
        break;
      }
    }
    let dist = Math.log2(places[i].distance);

    const xdiff = places[i].latitude - user_position.latitude;
    const ydiff = places[i].longitude - user_position.longitude;

    const angle = Math.atan2(ydiff, xdiff);
    const x = dist * Math.cos(angle);
    const y = dist * Math.sin(angle);

    if (smallest < dist_from_i_to_user) {
      const j_data = graph.getNodeAttributes(places[smallest_node].id);

      dist = Math.sqrt(40 / j_data.depth + dist_from_i_to_user);
      graph.addNode(places[i].id, {
        label: places[i].name,
        x: j_data.x + dist * Math.cos(angle),
        y: j_data.y + dist * Math.sin(angle),
        size: Math.max(6, Math.pow(places[i].restScore, 1.2) / 8),
        color: getNodeColor(places[i].restScore, max_rest_score, min_rest_score),
        place: places[i],
        depth: j_data.depth + 1
      });
      graph.addEdge(places[smallest_node].id, places[i].id);
    }
    else {
      // just attach at user.
      graph.addNode(places[i].id, {
        label: places[i].name,
        x: x,
        y: y,
        size: Math.max(6, Math.pow(places[i].restScore, 1.2) / 8),
        color: getNodeColor(places[i].restScore, max_rest_score, min_rest_score),
        place: places[i],
        depth: 1
      });
      graph.addEdge("user", places[i].id);

    }
  }

  renderer = new Sigma(graph, container);

  renderer.on("clickNode", (event) => {
    const node = graph.getNodeAttributes(event.node);

    if (node.place) {
      onSelect(node.place);
    }
  });
}


// in depth 1, green.
// in depth 2, orange.
// in higher depth, red.
function getNodeColor(score, max_rest_score, min_rest_score) {
  const score_mapped = mappingNumber(max_rest_score, min_rest_score, score);
  if (score_mapped >= 70) {
    return "green";
  }

  if (score_mapped >= 30) {
    return "orange";
  }
  // else case
  return "red";
}
// refines a number as max is 100, min is 0;
// f(min) = 0, f(max) = 100;
function mappingNumber(max, min, num) {
  return (num - min) / (max - min) * 100;
}