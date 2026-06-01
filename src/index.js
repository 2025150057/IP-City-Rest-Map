import express, { raw } from "express";
import { httpServerHandler } from "cloudflare:node";

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
app.post("/gps", (req, res) => {
	// when user sends gps data
	let coords = req.body;
	console.log("GPS Coordinates received:", coords);

	// Server responds back with the coords
	res.json({
		latitude: coords.latitude,
		longitude: coords.longitude
	});

	// TODO: server finds a closest seoul location of user's coords
	todo("server finds a closest seoul location of user's coords");
});

// request seoulapi for test.
app.get("/search-loc", (req, res) => {
	search_loc(req.query.locname,
		req.page_start || 1,
		req.page_end || 5
	).then((ret) => { res.json(ret) }, (err) => { console.error(err) });
});

async function search_loc(loc_name, page_start, page_end) {

	console.log(loc_name);
	const seoul_api_key = process.env.SEOUL_API_KEY || 'faa7c57e78db4bcf9b215f9b8dc74c9c';
	// found through looking at log. maybe default api key? 

	const seoul_api_url = "http://openapi.seoul.go.kr:8088/" +
		seoul_api_key +
		"/json" +
		"/citydata_ppltn" +
		"/" + String(page_start) +
		"/" + String(page_end) +
		"/" + loc_name;

	try {
		const data = await fetch(seoul_api_url);
		const JSONdata = await data.json();
		console.log("success, ", JSON.stringify(JSONdata, null, 2));

		return JSONdata;

	} catch (err) {
		console.error(err);
	}

}





// Start Express server locally on the internal bridge (port 0 selects any free ephemeral port)
const server = app.listen(0);

// Export the worker handler wrapped with httpServerHandler
export default httpServerHandler(server);


