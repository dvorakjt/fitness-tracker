//Api routes
module.exports = function (app) {
    app.get("/api/workouts", function (req, res) {
        console.log("api/workouts request made.");
        res.json({});
    });

    app.put("/api/workouts/:id", function (req, res) {
        console.log(`modified exercise with id ${req.params.id}`);
        res.json({});
    });

    app.post("/api/workouts", function (req, res) {
        console.log(req.body);
        res.json({});
    });

    app.get("/api/workouts/range", function (req, res) {
        console.log("range");
        res.json({});
    });
}