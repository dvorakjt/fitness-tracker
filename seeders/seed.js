let mongoose = require("mongoose");
let db = require("../models");

mongoose.connect("mongodb://localhost/workout", {
  useNewUrlParser: true,
  useFindAndModify: false
});

let workoutSeed = [
  {
    day: new Date().setDate(new Date().getDate() - 10),
    totalDuration: 40
  },
  {
    day: new Date().setDate(new Date().getDate() - 9),
    totalDuration: 10
  },
  {
    day: new Date().setDate(new Date().getDate() - 8),
    totalDuration: 40
  },
  {
    day: new Date().setDate(new Date().getDate() - 7),
    totalDuration: 10
  },
  {
    day: new Date().setDate(new Date().getDate() - 6),
    totalDuration: 40
  },
  {
    day: new Date().setDate(new Date().getDate() - 5),
    totalDuration: 10
  },
  {
    day: new Date().setDate(new Date().getDate() - 4),
    totalDuration: 40
  },
  {
    day: new Date().setDate(new Date().getDate() - 3),
    totalDuration: 10
  },
  {
    day: new Date().setDate(new Date().getDate() - 2),
    totalDuration: 40
  },
  {
    day: new Date().setDate(new Date().getDate() - 1),
    totalDuration: 40
  }
];

let exerciseSeed = [
  //workout 0
  {
    type: "cardio",
    name: "Cycling",
    distance: 20,
    duration: 40
  },
  // workout 1
  {
    type: "resistance",
    name: "Bench Presses",
    weight: 200,
    reps: 5,
    sets: 5,
    duration: 10
  },
  //workout 2
  {
    type: "cardio",
    name: "Cycling",
    distance: 20,
    duration: 40
  },
  // workout 3
  {
    type: "resistance",
    name: "Bench Presses",
    weight: 200,
    reps: 5,
    sets: 5,
    duration: 10
  },
  // workout 4
  {
    type: "cardio",
    name: "Cycling",
    distance: 20,
    duration: 40
  },
  // workout 5
  {
    type: "resistance",
    name: "Bench Presses",
    weight: 200,
    reps: 5,
    sets: 5,
    duration: 10
  },
  //workout 6
  {
    type: "cardio",
    name: "Cycling",
    distance: 20,
    duration: 40
  },
  //workout 7
  {
    type: "resistance",
    name: "Bench Presses",
    weight: 200,
    reps: 5,
    sets: 5,
    duration: 10
  },
  //workout 8
  {
    type: "cardio",
    name: "Cycling",
    distance: 20,
    duration: 40
  },
  //workout 9
  {
    type: "cardio",
    name: "Cycling",
    distance: 20,
    duration: 40
  }
];

db.Workout.deleteMany({})
  .then(() => db.Workout.collection.insertMany(workoutSeed))
  .then(data => {
    //set the workouts equal to the array returned by data.ops
    const workouts = data.ops;
    db.Exercise.deleteMany({}).then(() => {
      //this variable keeps track of everything that is seeded to the db and allows the process to end once all data is added
      let seedsComplete = 0;
      exerciseSeed.forEach((exercise, index) => {
        db.Exercise.create(exercise).then(({ _id }) => {
          //update each workout with each exercise
          db.Workout.findByIdAndUpdate(workouts[index]["_id"], { $push: { exercises: _id } }, { new: true })
            .then(dbWorkout => {
              console.log(dbWorkout);
              //if this is the last element, the connection can be ended
              seedsComplete++
              if (seedsComplete === 9) {
                process.exit();
              }
            });
        });
      });
    });

  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });