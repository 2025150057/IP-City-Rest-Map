/**
 * entry point to server.
 * @note this server is using cloudflare, also deployed manually by hand. so, as mentioned in readme.md, if you want to deploy next version(and you really need it), 
 * email to dhs2025@yonsei.ac.kr 
 * 
 */
import express from "express"; // welp. I personally like import, rather than express's weird require statement
import { httpServerHandler } from "cloudflare:node";
import requestRecomendPlaces from "./api/recommend.js";
import feedback from "./api/feedback.js";






// Initializing Express instance
const app = express();

// Parse JSON bodies
app.use(express.json());

app.get("/", (req, res) => {
	res.sendFile("index.html");
})

app.post("/api/recommend", async (req, res) => {

	const data = await requestRecomendPlaces(req.body);
	res.json({ places: data });
});

app.post("/api/feedback", async (req, res) => {
	const { selectedPlace, weights } = req.body; // just to show that req need those.
	const data = await feedback(selectedPlace, weights);

	res.json({ weights: data });
});

// Start Express server locally on the internal bridge (port 0 selects any free ephemeral port)
const server = app.listen(0);

// Export the worker handler wrapped with httpServerHandler
export default httpServerHandler(server);


