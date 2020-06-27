let mongoose = require("mongoose");
let db = require("../models");

mongoose.connect("mongodb://localhost/workout", {
  useNewUrlParser: true,
  useFindAndModify: false
});

let workoutSeed = [
  {
    day: new Date().setDate(new Date().getDate() - 10),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 9),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 8),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 7),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 6),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 5),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 4),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 3),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 2),
    totalDuration: 0
  },
  {
    day: new Date().setDate(new Date().getDate() - 1),
    totalDuration: 0
  }
];

db.Workout.deleteMany({})
  .then(() => db.Workout.collection.insertMany(workoutSeed))
  .then(data => {
    console.log(data.result.n + " records inserted!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
