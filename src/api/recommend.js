import { searchNearbyByKeyword, calculateDistance } from "./map";
import getClosestPlaceName from "./gps";
import getDensity from "./seoulapi";

const DEFAULT_SCORE = 0;


/**
 * Calculates the rest score of a place based on user preference weights.
 * @param {Object} place 
 * @param {number} place.distance 
 * @param {string} place.crowdLevel 
 * @param {number} place.pm10 
 * @param {Object} weights 
 * @returns {{ restScore: number, subScores: Object }}
 */
export function calculateRestScore(place, weights) {
    //note that weights are in between [0,1]. 

    // 1. Distance Score: 100 max, penalty based on distance in meters (drops to 0 at 1500m)
    const score_distance = Math.max(0, 100 - (place.distance / 15));

    // 2. Crowd Score: Less crowded is better
    let score_crowd = 50;
    if (place.crowdLevel === "여유") score_crowd = 100;
    else if (place.crowdLevel === "보통") score_crowd = 70;
    else if (place.crowdLevel === "약간 붐빔") score_crowd = 40;
    else if (place.crowdLevel === "붐빔") score_crowd = 10;

    // 3. Air Quality Score: Step function for PM10
    let score_air = 50;
    const pm10 = place.pm10 || 30;
    if (pm10 <= 30) score_air = 100;
    else if (pm10 <= 80) score_air = 70;
    else if (pm10 <= 150) score_air = 40;
    else score_air = 10;

    // 4. Type Score: a score that is written in weight object.
    let score_type = 0;
    if (place.type === "cafe") {
        score_type = weights.cafe * 100;
    }
    else if (place.type === "park") {
        score_type = weights.park * 100;
    }
    else if (place.type === "walk") {
        score_type = weights.walk * 100;
    }
    else {
        score_type = DEFAULT_SCORE;
    }

    const w = weights || { distance: 0.3, crowd: 0.4, air: 0.2, cafe: 0.2, walk: 0.5, park: 0.1 };
    const totalWeight = (w.distance || 0) + (w.crowd || 0) + (w.air || 0) + (w.cafe || 0) + (w.walk || 0) + (w.park || 0) || 1;

    const score = (
        (score_distance * (w.distance || 0)) +
        (score_crowd * (w.crowd || 0)) +
        (score_air * (w.air || 0)) +
        (score_type)
    ) / totalWeight;

    return {
        restScore: Math.round(score),
        subScores: {
            distance: score_distance,
            crowd: score_crowd,
            air: score_air,
            type: score_type
        }
    };
}

/**
 * Generates dynamic recommendation reason based on sub-scores and weights.
 */
function generateReason(subScores, weights, place) {
    const w = weights || { distance: 0.3, crowd: 0.4, air: 0.2, cafe: 0.2, walk: 0.5, park: 0.1 };

    if (Math.max(subScores.distance, subScores.crowd, subScores.air, subScores.type) == subScores.distance) {
        return "현재 위치와 가까운 곳이기에 추천합니다.";
    }
    else if (Math.max(subScores.distance, subScores.crowd, subScores.air, subScores.type) == subScores.crowd) {
        return "주변이 한적하여 여유롭게 휴식하기 좋습니다.";
    }
    else if (Math.max(subScores.distance, subScores.crowd, subScores.air, subScores.type) == subScores.air) {
        return "공기 질이 쾌적하여 휴식하기 좋습니다.";
    }
    else if (Math.max(subScores.distance, subScores.crowd, subScores.air, subScores.type) == subScores.type) {
        if (place.type === "cafe") {
            return "카페를 우선으로 선호했기에 추천된 장소입니다.";
        }
        else if (place.type === "park") {
            return "공원을 우선으로 선호했기에 추천된 장소입니다.";
        }
        else if (place.type === "walk") {
            return "산책로를 우선으로 선호했기에 추천된 장소입니다.";
        }
        else {
            return "선호하는 장소를 우선으로 고려하여 추천된 장소입니다.";
        }
    }
}

/**
 * @param {Array} congestionTrend
 * @param {Object} congestionTrend.i
 * @param {String} congestionTrend.i.FCST_TIME : format is '2026-06-02 13:55'
 * @param {String} congestionTrend.i.FCST_CONGESST_LVL : one of {여유, 보통, 약간 붐빔, 붐빔}
 * @note FCST_CONGEST_LVL has same enum type with crowdlvl.
 * @param {Number} congestionTrend.i.FCST_PPTLN_MIN 
 * @param {Number} congestionTrend.i.FCST_PPTLN_MAX
 * @returns {Array} 
 * Generates simulated congestion trend data for D3 visualization.
 */
function generateCongestionTrend(congestionTrend) {
    if (!congestionTrend || !Array.isArray(congestionTrend)) {
        return [
            { time: "10:00", value: 50 },
            { time: "11:00", value: 50 },
            { time: "12:00", value: 50 },
            { time: "13:00", value: 50 },
            { time: "14:00", value: 50 }
        ];
    }

    let number_of_timestamps = congestionTrend.length;
    let trendValues = [];
    for (let i = 0; i < number_of_timestamps; i++) {
        const item = congestionTrend[i];
        if (!item || !item.FCST_TIME) continue;

        // Parse time part directly from string "YYYY-MM-DD HH:MM"
        let timeString = item.FCST_TIME.split(" ")[1] || "00:00";

        // Map Korean congestion levels to numeric percentages (0-100) for line chart
        const lvl = item.FCST_CONGESST_LVL || item.FCST_CONGEST_LVL;
        let numericValue = 50;
        if (lvl === "여유") numericValue = 30;
        else if (lvl === "보통") numericValue = 50;
        else if (lvl === "약간 붐빔") numericValue = 70;
        else if (lvl === "붐빔") numericValue = 90;

        trendValues.push({
            time: timeString,
            value: numericValue
        });
    }

    return trendValues;
}

/**
 * @abstract request recommended places.
 * @param {Object} user_data - user data.
 * @param {Array} [place_types] - place types.
 * @returns {Promise<Array>} server response.
 */
export default async function requestRecomendPlaces(user_data, place_types) {
    let recommended_places = [];

    const types = place_types || user_data.placeType || ["산책", "카페", "공원"];

    const closest_place_names = await getClosestPlaceName({ latitude: user_data.position.latitude, longitude: user_data.position.longitude });

    const closest_place_including_density_data = await getDensity(closest_place_names);

    //console.log(closest_place_including_density_data);

    await Promise.all(closest_place_including_density_data.map(async (place) => {
        for (let place_type of types) {
            let nearby_rest_places = await searchNearbyByKeyword(place_type, place.LONGITUDE, place.LATITUDE, 5000, 5);

            nearby_rest_places.forEach((rest_place) => {
                const lat = parseFloat(rest_place.y);
                const lon = parseFloat(rest_place.x);

                // Calculate distance from the user's actual location
                const distKm = calculateDistance(
                    user_data.position.latitude,
                    user_data.position.longitude,
                    lat,
                    lon
                );
                const distanceMeters = Math.round(distKm * 1000);

                let placeTypeEng = "";
                if (place_type === "카페") placeTypeEng = "cafe";
                else if (place_type === "공원") placeTypeEng = "park";
                else if (place_type === "산책") placeTypeEng = "walk";

                // Build frontend-compatible place object
                const mappedPlace = {
                    id: rest_place.id || `place-${Math.random().toString(36).substr(2, 9)}`,
                    name: rest_place.place_name,
                    category: place_type,
                    type: placeTypeEng,
                    latitude: lat,
                    longitude: lon,
                    distance: distanceMeters,
                    crowdLevel: place.density,
                    pm10: place.pm10,
                    pm25: place.pm25,
                    air_quality: place.air_quality,
                    congestionTrend: place.FCST_PPLTN
                };

                // Compute priority-weighted restScore and assign metadata
                const scoreResult = calculateRestScore(mappedPlace, user_data.weights);
                mappedPlace.restScore = scoreResult.restScore;
                mappedPlace.reason = generateReason(scoreResult.subScores, user_data.weights, mappedPlace);
                mappedPlace.congestionTrend = generateCongestionTrend(mappedPlace.congestionTrend);

                recommended_places.push(mappedPlace);
            });
        }
    }));

    // Deduplicate recommended places by ID, keeping the one with the highest restScore
    const unique_places = new Map();
    recommended_places.forEach((p) => {
        if (!unique_places.has(p.id) || p.restScore > unique_places.get(p.id).restScore) {
            unique_places.set(p.id, p);
        }
    });
    recommended_places = Array.from(unique_places.values());

    // Sort recommended places by restScore descending
    recommended_places.sort((a, b) => b.restScore - a.restScore);

    const page = user_data.page || 1;
    const count = typeof user_data.count === "number" ? user_data.count : recommended_places.length;

    const start = Number.isFinite(count) ? (page - 1) * count : 0;
    const end = Number.isFinite(count) ? page * count : recommended_places.length;

    const result = recommended_places.slice(start, end);
    return result;
}