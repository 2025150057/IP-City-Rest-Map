import { calculateRestScore } from "./recommend.js";

/**
 * 
 * @param {Object} selectedPlace - selected place.
 * @param {Object} weights - weights.
 * @param {Number} weights.distance
 * @param {Number} weights.crowd
 * @param {Number} weights.air
 * @param {Number} weights.cafe
 * @param {Number} weights.park
 * @param {Number} weights.walk
 * @note weights are defined at public/js/storage.js.
 * look at readWeightsFromInputs func.
 * @returns {Object} - updated weights.
 * 
 */
export default async function feedback(selectedPlace, weights) {
    if (!selectedPlace || !weights) {
        return weights;
    }

    const { subScores } = calculateRestScore(selectedPlace, weights);

    let new_weights = { ...weights };
    // chosen randomly.
    const learning_rate = 0.3;

    // Update weights incrementally based on the selected place's characteristic quality
    new_weights.distance = (weights.distance * (1 - learning_rate) + learning_rate * (subScores.distance / 100));
    new_weights.crowd = (weights.crowd * (1 - learning_rate) + learning_rate * (subScores.crowd / 100));
    new_weights.air = (weights.air * (1 - learning_rate) + learning_rate * (subScores.air / 100));

    // Cafe, Park, Walk scores (100 if it matches, 0 otherwise)
    const score_cafe = selectedPlace.type === "cafe" ? 100 : 0;
    const score_park = selectedPlace.type === "park" ? 100 : 0;
    const score_walk = selectedPlace.type === "walk" ? 100 : 0;

    new_weights.cafe = (weights.cafe * (1 - learning_rate) + learning_rate * (score_cafe / 100));
    new_weights.park = (weights.park * (1 - learning_rate) + learning_rate * (score_park / 100));
    new_weights.walk = (weights.walk * (1 - learning_rate) + learning_rate * (score_walk / 100));

    console.log("Updated weights:", new_weights);
    return new_weights;
}