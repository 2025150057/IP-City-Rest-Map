import express from "express";
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

// Start Express server locally on the internal bridge (port 0 selects any free ephemeral port)
const server = app.listen(0);

// Export the worker handler wrapped with httpServerHandler
export default httpServerHandler(server);
