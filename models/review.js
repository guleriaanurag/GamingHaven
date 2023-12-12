const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating : {
        type : Number,
        min : 0,
        max : 5
    },
    comment : {
        type : String,
        trim : true
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'newUser'
    }
},{timestamps: true});

const review = mongoose.model('review',reviewSchema);

module.exports = review;
