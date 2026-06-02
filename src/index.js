import express, { raw } from "express";
import { httpServerHandler } from "cloudflare:node";
import getClosestPlaceName from "./gps";
import getDensity, { search_loc } from "./seoulapi";


/**
 * Run a test function only in development environment.
 * @template T
 * @param {()=>T} test
 * @return {T}
 * @throws {Error} If it's not dev environment.
 */
function debug(test) {
	if (process.env.NODE_ENV === "development") {
		return test();
	}
}

/**
 * Make an error!!!!!
 * @throws {Error} Always throws an error.
 * @param {string|undefined} message - The error message to throw. If not provided, a default message will be used.
 */
function todo(message) {
	throw new Error(message || "TODO: Implement this function!");
}

// Initializing Express instance
const app = express();

// Parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
	res.sendFile("index.html");
})


// GPS data processing endpoint
app.post("/gps", async (req, res) => {
	// when user sends gps data
	let coords = req.body;
	console.log("GPS Coordinates received:", coords);


	const num = 3;
	const closestPlaces = await getClosestPlaceName(coords, num);

	//console.log(closestPlaces);

	const density_array = await getDensity(closestPlaces);

	//console.log(density_array);

	res.json({ density_array });



});

// request seoulapi for test.
app.get("/search-loc", (req, res) => {
	search_loc(req.query.locname,
		req.page_start || 1,
		req.page_end || 5
	).then((ret) => { res.json(ret) }, (err) => { console.error(err) });
});








// Start Express server locally on the internal bridge (port 0 selects any free ephemeral port)
const server = app.listen(0);

// Export the worker handler wrapped with httpServerHandler
export default httpServerHandler(server);


