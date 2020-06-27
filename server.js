//require express and mongoose
const express = require("express");
const mongoose = require("mongoose");
const db = require("./models");

//set up the app
const app = express();
const PORT = process.env.PORT || 8080;

//Enable data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Use the public directory to serve static resources
app.use(express.static("public"));

require("./routes/api-routes.js")(app);
require("./routes/html-routes.js")(app);

//connect to mongoose
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

// //Delete records from the db then start the server.
// db.Workout.deleteMany({}).then(result => {
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
})
// })