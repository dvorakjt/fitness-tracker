//require express
const express = require("express");

//set up the app
const app = express();
const PORT = process.env.PORT || 8080;

//Enable data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Use the public directory to serve static resources
app.use(express.static("public"));

// require("./routes/api-routes.js")(app);
require("./routes/html-routes.js")(app);

//Start the server.
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});