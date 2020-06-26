const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
    //need to model a relationship to the workout model
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        trim: true,
        require: true
    },
    weight: {
        type: Number
    },
    reps: {
        type: Number
    },
    sets: {
        type: Number
    },
    duration: {
        type: Number,
        required: true
    },
    distance: {
        type: Number
    }
});

const Exercise = mongoose.model("Exercise", ExerciseSchema);

module.exports = Exercise;