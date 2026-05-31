//importing express
const express = require("express");
const path = require("path");



//initializing express instance.
const app = express();

app.use(express.static("public/src"));

//parse JSON bodies
app.use(express.json());


//handle localhost get method.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/src/html/index.html"));
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




});

