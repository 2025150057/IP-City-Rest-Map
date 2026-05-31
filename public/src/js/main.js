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
    try {
        const coords = await getLoc();
        console.log("Latitude:", coords.latitude, "Longitude:", coords.longitude);

        fetch("/gps", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(coords)
        }).then(res => res.json())
            .then(data => console.log(data))
            .catch(err => console.error(err));
    } catch (error) {
        console.log("Failed to get location", error);
    }
        /** */
}



run();
