import express, { raw } from "express";
import { httpServerHandler } from "cloudflare:node";
import { searchNearbyRestAreas } from "./api/map.js";
import getClosestPlaceName from "./api/gps.js";
import getDensity, { search_loc } from "./api/seoulapi.js";
import requestRecomendPlaces from "./api/recommend.js";

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

// get nearby rest areas (raw results) — scoring is handled elsewhere
app.post("/rest-area-ranking", async (req, res) => {
	const { longitude, latitude, radius = 1200, size = 25 } = req.body;

	if (longitude == null || latitude == null) {
		return res.status(400).json({ error: "longitude and latitude are required" });
	}

	try {
		const places = await searchNearbyRestAreas(longitude, latitude, radius, size);
		return res.json({ places });
	} catch (err) {
		console.error("Failed to fetch rest areas:", err);
		return res.status(500).json({ error: err.message });
	}
});

// request seoulapi for test.
app.get("/search-loc", (req, res) => {
	search_loc(req.query.locname,
		req.page_start || 1,
		req.page_end || 5
	).then((ret) => { res.json(ret) }, (err) => { console.error(err) });
});

app.post("/api/recommend", async (req, res) => {
	console.log("recommending!");
	const data = await requestRecomendPlaces(req.body);

	res.json({ places: data });
});

app.post("/api/feedback", async (req, res) => {
	const data = await feedback(req.body);

	res.json({ weights: data });
});




// Start Express server locally on the internal bridge (port 0 selects any free ephemeral port)
const server = app.listen(0);

// Export the worker handler wrapped with httpServerHandler
export default httpServerHandler(server);


