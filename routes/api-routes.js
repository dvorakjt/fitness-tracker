//require in the models directory
const mongoose = require("mongoose");
const db = require("../models");

//require moment
const moment = require("moment");

//Api routes
module.exports = function (app) {
    app.get("/api/workouts", function (req, res) {
        db.Workout.find({})
            .populate("exercises")
            .then(dbWorkout => {
                res.json(dbWorkout);
            });
    });

    app.post("/api/workouts", function (req, res) {
        db.Workout.create({}).then(dbWorkout => {
            console.log(dbWorkout);
            res.json(dbWorkout);
        });
    });

    app.put("/api/workouts/:id", async function (req, res) {
        //first get the current workout's total duration
        const thisWorkout = await db.Workout.findById(req.params.id);
        let totalDur = thisWorkout.totalDuration += req.body.duration;

        //once an exercise is created, use object destructuring to grab its id
        db.Exercise.create(req.body).then(({ _id }) => {
            /*find a workout by the id from the req.params then push the current exercise to that workout's
            exercise array */
            db.Workout.findByIdAndUpdate(req.params.id, { $push: { exercises: _id }, $set: { totalDuration: totalDur } }, { new: true })
                .then(dbWorkout => {
                    res.json(dbWorkout);
                })
                .catch(err => {
                    res.json(err);
                });
        });
    });

    app.get("/api/workouts/range", function (req, res) {
        //use moment to find last sunday, the query for dates greater than that
        //first get today
        let today = moment().day() + 1; //returns a number from 0 to 6
        //now subtract that number from today's date to find last sunday
        const startDay = new Date(moment().subtract(today, 'd').startOf('day').toISOString());
        //greater than or equal to startdate
        console.log(startDay);
        console.log(startDay instanceof Date);
        db.Workout.find({})
            .populate("exercises")
            .then(dbWorkout => {
                //filters the results so that they begin on sunday
                const data = dbWorkout.filter(document => document.day >= startDay);
                console.log(data);
                res.json(data);
            });
    });
}