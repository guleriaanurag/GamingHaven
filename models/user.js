const mongoose =  require('mongoose')
const product = require('./products');

const newUserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    cart : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'product'
        }
    ],
    deliveryAddress : [
        {
            type : String,
            trim : true
        }
    ]
})



const newUser = mongoose.model('newUser',newUserSchema);
module.exports = newUser
