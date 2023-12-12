require('dotenv').config();
const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
    },
    ImageName : {
        type : String,
        default :'NoImage.jpg'
    },
    sourceLink : {
        type : String,
        required : true,
        trim : true
    }
})

const game = mongoose.model('game',gameSchema);
module.exports = game;
