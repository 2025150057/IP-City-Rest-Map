//importing express
const express = require("express");
const { static: expressStatic, json } = require("express");
const { join } = require("path");

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
 * Make a error!!!!!
 * @throws {Error} Always throws an error.
 * @param {string|undefined} message - The error message to throw. If not provided, a default message will be used.
 */
function todo(message) {
    throw new Error(message || "TODO: Implement this function!");
}
//initializing express instance.
const app = express();

app.use(expressStatic("public/src"));

//parse JSON bodies
app.use(json());

//handle localhost get method.
app.get("/", (req, res) => {
    console.log("working :)");
    res.sendFile("index.html");
});

//default port = 8000.
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log("started! :)");
    console.log(`address : http://127.0.0.1:${PORT}`);
});

// TODO : listen user api call and response.

app.post("/gps", (req, res) => {
    // when user sends a gps data.
    let coords = req.body;
    console.log(coords);
    // TODO: server finds a closest seoul location of user's coords
    res.json({
        latitude: coords.latitude,
        longitude: coords.longitude
    });
    todo("server finds a closest seoul location of user's coords");
});
