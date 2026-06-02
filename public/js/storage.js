const STORAGE_KEY = "cityRestMapWeights";

export const DEFAULT_WEIGHTS = {
  distance: 0.3,
  crowd: 0.4,
  air: 0.2,
  type: 0.1
};

export function loadWeights() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return { ...DEFAULT_WEIGHTS };
  }

  try {
    return JSON.parse(saved);
  } catch {
    return { ...DEFAULT_WEIGHTS };
  }
}

export function saveWeights(weights) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
}

export function readWeightsFromInputs() {
  return {
    distance: Number(document.getElementById("weight-distance").value),
    crowd: Number(document.getElementById("weight-crowd").value),
    air: Number(document.getElementById("weight-air").value),
    type: Number(document.getElementById("weight-type").value)
  };
}

export function applyWeightsToInputs(weights) {
  document.getElementById("weight-distance").value = weights.distance;
  document.getElementById("weight-crowd").value = weights.crowd;
  document.getElementById("weight-air").value = weights.air;
  document.getElementById("weight-type").value = weights.type;
}