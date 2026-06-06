
//import places data.
import places from "../../datas/output.json";


/**
 * @abstract
 * 1. get user's gps data.
 * 2. foreach loop for all places.
 * 3. return the closest&some more places.
 * 
 * @param {Object} coords 
 * @param {number} coords.longitude 
 * @param {number} coords.latitude 
 * @param {number} num - number of places to return.
 * @returns {Array} array of places.
 * 
 */
export default async function getClosestPlaceName(coords, num = 3) {
    const longitude = coords.longitude;
    const latitude = coords.latitude;

    let closestPlaces = [];
    places.forEach(place => {
        const distance = Math.sqrt(Math.pow(place.LONGITUDE - longitude, 2) + Math.pow(place.LATITUDE - latitude, 2));
        place.distance = distance;
        closestPlaces.push(place);
    });

    closestPlaces = closestPlaces.sort((a, b) => a.distance - b.distance).slice(0, num);

    // return only num numbers.
    return closestPlaces;
}
