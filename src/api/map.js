import dotenv from "dotenv";

dotenv.config();


/**
 * Get a single location's address/coordinates from Kakao Local API (Acutla API call)
 * @param {string} loc_name
 * @returns {Promise<{name:string,address:string,longitude:string,latitude:string}>}
 */
export async function getLocDataFromKakao(loc_name) {
    const kakao_api_url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(loc_name)}&size=1`;

    try {
        const res = await fetch(kakao_api_url, {
            headers: {
                "content-type": "application/json;charset=UTF-8",
                "Authorization": `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
            }
        });
        const json = await res.json();

        if (!json.documents || json.documents.length === 0) {
            return { name: loc_name, address: "", longitude: "", latitude: "" };
        }

        const doc = json.documents[0];
        return { name: loc_name, address: doc.address_name ?? "", longitude: doc.x ?? "", latitude: doc.y ?? "" };
    } catch (err) {
        console.error(`getLocDataFromKakao failed for ${loc_name}:`, err?.message || err);
        return { name: loc_name, address: "", longitude: "", latitude: "" };
    }
}


/** Enrich location array with coordinates using Kakao */
export async function enrichLocationsWithCoordinates(locationsArray, nameField = "KOR_NM") {
    await Promise.all(locationsArray.map(async (element) => {
        const queryName = element.NM_ALTER !== "NONE" ? element.NM_ALTER : element[nameField];
        try {
            const locData = await getLocDataFromKakao(queryName);
            element.ADDRESS = locData.address;
            element.LONGITUDE = locData.longitude;
            element.LATITUDE = locData.latitude;
        } catch (err) {
            console.error(`Failed to enrich data for ${queryName}:`, err);
            element.ADDRESS = "";
            element.LONGITUDE = "";
            element.LATITUDE = "";
        }
    }));
    return locationsArray;
}


//////////////////////////
//   search functions   //
//////////////////////////

/**
 * Search nearby Kakao local places by keyword (uses x/y center and radius)
 * @param {string} keyword
 * @param {number|string} longitude
 * @param {number|string} latitude
 * @param {number} radius meters
 * @param {number} size number of results
 */
export async function searchNearbyByKeyword(keyword, longitude, latitude, radius = 1000, size = 15) {
    const kakao_api_url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&x=${longitude}&y=${latitude}&radius=${radius}&size=${size}`;

    try {
        const res = await fetch(kakao_api_url, {
            headers: {
                "content-type": "application/json;charset=UTF-8",
                "Authorization": `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
            }
        });
        const json = await res.json();
        if (!json.documents) return [];
        return json.documents;
    } catch (err) {
        console.error(`searchNearbyByKeyword failed:`, err?.message || err);
        return [];
    }
}

// probably what we will actually use <--- um.... saddly, narrowing keyword only to '쉼터' was toooo small.. what a disappoint...
export async function searchNearbyRestAreas(longitude, latitude, radius = 1000, size = 15) {
    return searchNearbyByKeyword("쉼터", longitude, latitude, radius, size);
}




///////////////////////////
// calculation functions //
///////////////////////////

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = v => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find closest location from array of locations
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {Array} locations - Array of location objects with LATITUDE and LONGITUDE
 * @returns {Object} Closest location object with distance added
 */
export function findClosestLocation(userLat, userLon, locations) {
    let closest = null;
    let minDistance = Infinity;

    locations.forEach(location => {
        if (location.LATITUDE && location.LONGITUDE) {
            const distance = calculateDistance(userLat, userLon, location.LATITUDE, location.LONGITUDE);
            if (distance < minDistance) {
                minDistance = distance;
                closest = { ...location, distance };
            }
        }
    });

    return closest;
}
