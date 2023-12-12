const express = require('express');
const router = express.Router();
const {upload} = require('../src/multer')
const product = require('../models/products');

router.get('/addProducts',(req,res)=>{
    // console.log(req.session.userId);
    res.render('addProduct')
})

router.post('/addProducts',upload.array('image',5),async(req,res)=>{
    let prod = {
        name : req.body.prodName,
        ImageName : req.files.map(file=>file.filename),
        category : req.body.prodCategory,
        price : req.body.prodPrice,
        Desc : req.body.prodDesc,
        author : req.session.userId
    }
    if(req.session.loginSuccess === true){
        await product.insertMany([prod]);
        res.redirect('/addProducts');
    }
    else{
        return res.status(400).send('You need to login, to add products');
    }
})

module.exports = router;