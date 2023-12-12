const mongoose = require('mongoose');

const prodSchema = mongoose.Schema({
    name: {
        type : String,
        trim : true,
        required : true
    },
    ImageName : {
        type : [String],
        default : ['NoImage.jpg']
    },
    category : {
        type : String
    },
    price : {
        type : Number,
        required : true,
    },
    Desc : {
        type : String,
        default : 'No Description',
        trim : true
    },
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'newUser'
    },
    maxStock : {
        type : Number,
        default : 100
    },
    reviews : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'review'
    }
    ]
})

let prod = mongoose.model('prod',prodSchema);

module.exports = prod;
