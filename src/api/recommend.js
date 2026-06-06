import { searchNearbyByKeyword } from "./map";
import getClosestPlaceName from "./gps";
import getDensity from "./seoulapi";


/**
 * @abstract request recommended places.
 * the kind of places are : 
 * 1. walk place
 * 2. cafe
 * 3. park
 * @param {Object} user_data - user data.
 * @param {Object} user_data.position - user position.
 * @param {number} user_data.position.latitude - user latitude.
 * @param {number} user_data.position.longitude - user longitude.
 * @param {Object} user_data.weights - user weights.
 * @param {number} user_data.weights.distance - distance weight.
 * @param {number} user_data.weights.crowd - crowd weight.
 * @param {number} user_data.weights.air - air weight.
 * @param {number} user_data.weights.type - type weight.
 * @param {Array} place_types - place types.
 * 
 * @returns {Promise<Object>} server response.
 */
export default async function requestRecomendPlaces(user_data, place_types = ["산책", "카페", "공원"]) {
    let recommended_places = [];

    const closest_place_names = await getClosestPlaceName({ latitude: user_data.position.latitude, longitude: user_data.position.longitude });

    const closest_place_including_density_data = await getDensity(closest_place_names);

    console.log(closest_place_including_density_data);


    await Promise.all(closest_place_including_density_data.map(async (place) => {


        for (let place_type of place_types) {
            let nearby_places = await searchNearbyByKeyword(place_type, place.LATITUDE, place.LONGITUDE, distance = 5000, size = 5);
            nearby_places.forEach((place) => {
                //place_type, place_name already exists. 

                //note that distance is from place.
                // so, we need to change it from user_data's.
                place.distance = Math.sqrt(Math.pow(place.LONGITUDE - user_data.position.longitude, 2) + Math.pow(place.LATITUDE - user_data.position.latitude, 2));

                place.crowdLevel = place.density;

                recommended_places.push(place);
            })
        }





    }))

    for (let place_type of place_types) {
        let nearby_places = await searchNearbyByKeyword(place_type, user_data.position.latitude, user_data.position.longitude, size = 5);
        recommended_places = recommended_places.concat(nearby_places);
        // logging for nearby places
        console.log(nearby_places);
    }

    console.log(recommended_places);
    console.log(recommended_places.length);
    return recommended_places;
}