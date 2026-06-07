/**
 * @abstract this function query about density of requested places.
 * 
 * @param {Array} datas - array of places.
 * @param {object} datas[i] - object of place.
 * @param {string} datas[i].KOR_NM - name of place.
 * @param {string} datas[i].AREA_CD - code of area(will be used to query) 
 * 
 * @returns {Array} array of objects, each object has "name" and "density" values.
 * @note density = one of {여유, 보통, 약간 붐빔, 붐빔}
 */

export default async function getDensity(datas) {

    const densityData = await Promise.all(
        datas.map(async (place) => {
            const area_cd = place.AREA_CD;
            const name = place.KOR_NM;

            //get density data

            try {
                const res = await search_loc(area_cd, 1, 1);
                const density_data = res?.CITYDATA?.LIVE_PPLTN_STTS?.[0];
                // get pptln(population) data.
                place.density = density_data?.AREA_CONGEST_LVL || "null";

                place.FCST_PPLTN = density_data?.FCST_PPLTN || null;

                const weather_data = res?.CITYDATA?.WEATHER_STTS[0];
                // get weather data, most importantly including pm10.
                place.pm10 = weather_data?.PM10 || null;
                place.pm25 = weather_data?.PM25 || null;
                place.air_quality = weather_data?.AIR_IDX || "null";

            } catch (err) {
                console.error(err);
                place.density = "err";
            }

            return place;

        })
    );

    return densityData;
}


/**
 * @abstract search specific places using seoul api.
 * 
 * @param {string} loc_name - name of place.
 * @param {number} page_start - start page.
 * @param {number} page_end - end page.
 * 
 * @returns {Object} JSON data from seoul api.
 * @throws {Error} If api key not found or fetch failed.
 */
export async function search_loc(loc_name, page_start = 1, page_end = 1) {

    const seoul_api_key = process.env.SEOUL_API_KEY || null;

    if (seoul_api_key === null) {
        console.error("api key not found!");
        throw Error("api key not found! seoul_api_key is null!");
    }



    const seoul_api_url = "http://openapi.seoul.go.kr:8088/" +
        seoul_api_key +
        "/json" +
        "/citydata" +
        "/" + String(page_start) +
        "/" + String(page_end) +
        "/" + loc_name;

    try {
        const data = await fetch(seoul_api_url);
        const JSONdata = await data.json();

        return JSONdata;

    } catch (err) {
        console.error(err);
    }

}
