// TODO: send GPS data. 

console.log("worked");

/** GET USER's current location by geolocation api.
 *  @constructor
 *  INPUT: NONE
 *  @returns {Number, Number}
 *  throw error if geolocation function failed or user rejected the permission.
 *  note that this function takes 5~10 sec. 
    */
function getLoc() {

    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("success at getLOC");
                    // Return an object containing both coordinates
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("ERR at getLOC!", error);
                    reject(error);
                }
            );
        } else {
            reject(new Error("Geolocation is not supported by this browser, or user rejected the permission"));
        }
    });
}

// Example of how to use it synchronously with async/await
async function run() {
    // just a test func.

    let loc_name = prompt("write a loc name");
    if (loc_name !== null) {
        try {

            let response = await fetch(`/search-loc?locname=${loc_name}`);

            if (!response.ok) {
                throw new Error(`http response err! Status:${response.status}`);
            }

            let data = await response.json();
            console.log("sucess, ", data);

        } catch (error) {
            console.error(`err happend at fetching. ${error}`);
        }

    }

}

async function getClosestPlacesFromUser() {
    const coords = await getLoc();

    let response = await fetch("/gps", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(coords),
    });

    const data = await response.json();

    logAtParagraph(JSON.stringify(data, null, 2));

    return data;
}

function logAtParagraph(msg) {
    document.getElementById("dev").innerText += msg;
}


/**
 * @abstract this function inputs "places" e.g. cafes, parks, etc...
 *  and returns an sorted array of each places through setted weights.
 *  
 * @param {Array} places - array of places. 
 * @returns {Array} sorted array of places.
 */
function CalcPriorityThroughWeights(places) {
    throw new Error("NOT WORKED!");

}


async function main() {
    getClosestPlacesFromUser().catch((err) => { console.error(err) });


}


















getClosestPlacesFromUser().catch((err) => { console.error(err) });

//run();
