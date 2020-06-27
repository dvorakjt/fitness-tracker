# Fitness Tracker
![Screenshot of app](./assets/screenshots/screen-1.png)
This project allows the user to keep track of all of their workouts, and the exercises therein by adding workouts, adding exercises, and continuing workouts. This was an assignment in the Penn LPS Coding Bootcamp, and therefore the frontend code was provided to us. Our task was to integrate with a server and use Mongoose to establish a MongoDB database. Please view the deployed app [here.](https://young-reef-05272.herokuapp.com/)
## Table of Contents

[Introduction](#introduction)  
[Installation](#installation)  
[Dependencies](#dependencies)
[The Code](#the-code)
[Usage](#usage)  
[Contributing](#contributing)  
[About the Author](#about-the-author)  

## Introduction

![GitHub language count](https://img.shields.io/github/languages/count/dvorakjt/geneREADME) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/dvorakjt/geneREADME) ![GitHub repo size](https://img.shields.io/github/repo-size/dvorakjt/geneREADME)



## Installation

Either navigate to the deployed app, or download the files and run <code>npm install</code>. The advantage of downloading the files is that after installing the dependencies, you would be able to run the seed command by entering <code>npm run seed</code> in the terminal. 

## Dependencies

Express.js, Mongoose.js, Moment.js

## The Code
### Challenges, Successes, Areas for Improvement
Several challenges in this assignment included:
- Adjusting the seed file to meet my data model (which modeled a one-to-many relationship using two collections: workout and exercises)
- Interfacing with the provided front end code

#### The Seed File
The original seed file was set up to handle workouts which contained an array of exercises. However, I felt that logically, exercises and workouts should be their own collections, and modeled my data in this manner. Thus, my Workout model looks like this: 
<code>
const  WorkoutSchema = new  Schema({
day: {
type:  Date,
default:  Date.now()
},
</code><code>
exercises: [{
type:  Schema.Types.ObjectId,
ref:  "Exercise"
}],
</code><code>
totalDuration: {
type:  Number,
default:  0
}
});
</code>

The seed file as originally written is, however, not set up to deal with inserting exercises by their object id. In order to handle this, I removed the reference to exercises within the workoutSeed array inside the seed file. Then, I added another array containing exercise seeds. From there, I had to add additional methods inside the <code>.then</code> block that follows the call to <code>db.Workout.insertMany()</code>.

The returned workouts are contained in the .ops property of the data object that is returned, so `const workouts`is declared and initialized with the value `data.ops.`

All exercise documents in the collection are then deleted, and a seedsComplete variable is declared. This variable keeps track of how many workout documents have been updated with an ID from an exercise document and is necessary because of the asynchronous nature of the code.

My code next uses a forEach() loop to iterate through each of the objects in the exerciseSeed array. For each object, a new exercise document is created, and then the a corresponding workout is updated via the code:  <code>db.Workout.findByIdAndUpdate(workouts[index]["_id"], { $push: { exercises:  _id } }, { new:  true })</code>.
Once this update is complete, the seedsComplete variable is incrememented. If seedsComplete reaches the length of the seedArray, the process is terminated. This prevents the process from terminating before all records have been inserted (I had previously used index to determine when the process was to end, and found that the loop was executing faster than the asynchronous code, causing the process to terminate early and resulting in an incomplete data set).

This is the code for this entire process:

    db.Workout.collection.insertMany(workoutSeed))
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
This works correctly and seeds both workouts and exercises, as well as correctly modeling the relationship between the two. So I consider it a success.

#### Interfacing with the Frontend

Another challenge was interfacing with the Frontend, specifically the stats page. I consider my end result here to be only a partial success. 

The first issue I encountered was that the workout.js file (provided to us as part of the assignment) expected each workout to have a property called totalDuration. This was odd to me as the original seed file (again a file provided to us) did not contain any references to this property. 

So I restructured my Workout model and added this property. Then, I had to find a way to calculate it. This is what I came up with (located in the api-routes.js file):

    const thisWorkout = await db.Workout.findById(req.params.id);
    let totalDur = thisWorkout.totalDuration += req.body.duration;
    //once an exercise is created, use object destructuring to grab its id
    db.Exercise.create(req.body).then(({ _id }) => {
        /*find a workout by the id from the req.params then push the current exercise to that workout's exercise array */
        db.Workout.findByIdAndUpdate(req.params.id, { $push: { exercises: _id }, $set: { totalDuration: totalDur } }, { new: true })
       .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            res.json(err);
        });
     });
Essentially, when a new exercise is added to an existing workout, the function gets the totalDuration of the current exercise and adds to it the exercise's duration from req.body.duration. Then, when the workout is later updated to include the exercise in its exercises array, the totalDuration is at the same time set to totalDur. This solved the problem of the reference to the totalDuration property in the workout.js file.

Most of the integration issues I encountered were however in the stats page. From reading through the source code, it seemed that the first element in the data array that it received would always refer to Sunday on the chart. This brought up several questions in my mind?

- How to ensure that the first element in the array passed to the element is from a Sunday?
-  What if there aren't enough workout documents in the collection to ensure this?
- What if the user creates multiple workouts with the same date?
  
 I was able to mostly address the first two questions, but I couldn't solve the third one. I honestly think that to solve this, I might have to rethink the way the Frontend processes and renders the data it receives.
#### The /range Route and Ensuring that the first returned element is Sunday
I used the range route to address the issue of returning a Sunday as the first element in the json object that is sent back to the client. Here is what the code looks like:

    app.get("/api/workouts/range", function (req, res) {
            //use moment to find last sunday, the query for dates greater than that
            //first get today
            let today = moment().day(); //returns a number from 0 to 6
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

First, moment.js is used to get today's day of the week as a number.
Moment is then used to subtract that from today's date and find the date of last Sunday. The startDay variable is set to this value, as a Javascript Date. All of the workouts are found, and then all of the results with a date earlier than last Sunday are filtered out. I would have preferred to use the MongoDB syntax to accomplish this, but for some reason it was not successfully comparing dates even though as far as I could tell, I had the syntax correct. 

The result of this is that the data sent back to the client begins on a Sunday, if enough records exist in the db. When using the seeded db, the data displays correctly. However I did find that without data seeded, this function is still not enough to get the Frontend to render the data correctly. Thus I consider it only a partial success.

#### When last Sunday is not in the collection
When last Sunday is not in the collection, the stats page won't display correctly. Therefore, I added some code that adds empty elements to the beginning of the array if the first element is not Sunday. This code exists in the stats.js file and looks like this:

    let firstDay = array[0].day;
      firstDay = moment(firstDay).weekday();
      //if the firstday is not sunday, add empty elements to the array to account for the difference
      if (firstDay > 0) {
        for (let i = 0; i < firstDay; i++) {
          array.unshift({
            exercises: [{}],
            totalDuration: 0
          });
        }
      }
Moment is used to determine whether the first day in the array is a Sunday. If it is not, empty workout elements are added to the beginning array through an unshift method inside a for loop that counts up to the number of the first day. So for instance, if the first day is a Monday, then only one element is added because the loop stops once i is incremented from 0 to 1. This partially fixed the problem of the data not starting on Sunday. The durations chart now behaves correctly, but the bar chart still does not.

#### Multiple Workouts in the Same Day
Because the frontend code simply renders each element in the array it receives as its own day, it is inherently insensitive to multiple workouts with the same date. Therefore, I wrote a function which condenses these workouts into one. This is that function (again found inside stats.js):

    function condenseWorkouts(array) {
      array.forEach((workout, index) => {
        const workoutDay = moment(workout.day).startOf('day').format();
        //go through the array beginning after the current element and check for any days with multiple workouts
        for (let i = index + 1; i < array.length; i++) {
          const workout2 = array[i];
          const workoutDay2 = moment(workout2.day).startOf('day').format();
          //check to see if the days match
          if (workoutDay === workoutDay2) {
            //if they match, add the data from the record that matches to the first record, delete the second record, and finally
            //subtract 1 from i so that iteration resumes correctly
            //first, concat the exercises array
            workout.exercises = workout.exercises.concat(workout2.exercises);
            //next, add the total durations
            workout.totalDuration += workout2.totalDuration;
            console.log(workout);
            //splice the array to remove the duplicate date
            array.splice(i, 1);
            //subtract 1 from i so that iteration resumes correctly
            i--
          }
        }
      });
      //figure out if the first day is sunday
      let firstDay = array[0].day;
      firstDay = moment(firstDay).weekday();
      //if the firstday is not sunday, add empty elements to the array to account for the difference
      if (firstDay > 0) {
        for (let i = 0; i < firstDay; i++) {
          array.unshift({
            exercises: [{}],
            totalDuration: 0
          });
        }
      }
      return array;
    }
Note that the code that adds elements to the beginning of an array that doesn't begin on Sunday is part of this function. Again, this partially solved this issue. The result is that the line graph displays correctly, although the bar graph is still incorrect in terms of what exercises fell on what dates.
### Summary of Successes/Areas for Improvement
All in all, some successes included:
- Interfacing with the server and the database
- Creating the models
- Altering the seed so that it worked with two interdependent models
- Manipulating the data sent to the Frontend so that it always began on last Sunday
- Condensing workouts that happened in the same day into one, for display purposes on the stats page  

Some areas for improvement are:
- The way the Frontend sorts and displays the data it receives. I feel very strongly that instead of just looping through an array of information and assigning each workout to a day based on its place in that array, the Frontend should actually read the dates of the workouts and display the information accordingly. Because it does not do this (or does not appear to do this as far as I could tell), I had to write a lot of code which I feel borders on disorganized and solves the issues only very obliquely (and partially at that). If I were developing this app further, I would overhaul the structure of the Frontend, especially the stats page, so that it took into account the actual dates of workouts to determine how they were displayed.
## Usage
To use the app, navigate to the deployed version on Heroku, or download the files and run npm install, npm run seed and node server.js in the terminal. You should be able to add workouts of various types, continue the current workout, and view your progress on the stats page. =
## Contributing

If you notice any errors in the code, please create a Github issue. 

## Acknowledgements 
Frontend code and original seed file provided by Trilogy education.


## About the Author

Joe Dvorak

![your github profile pic](https://avatars3.githubusercontent.com/u/61166366?v=4
Github: dvorakjt

Github repository: [github.com/dvorakjt](https://github.com/dvorakjt/)

Portfolio: [dvorakjt.github.io/](https://userName.github.io/)  

  
Written with [StackEdit](https://stackedit.io/). Badges provided through shield
