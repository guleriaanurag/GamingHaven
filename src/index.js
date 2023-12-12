const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
require('dotenv').config()
const port = process.env.PORT
const axios = require('axios')
const flash = require('express-flash')
const newUser = require('../models/user')
const game = require('../models/games')
const product = require('../models/products')
const review = require('../models/review')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const {upload} = require('./multer')
const apiKey = process.env.api_key
const saltRounds = 13
const shopRouter = require('../routes/shopRouter')
const { log } = require('console')
const { default: mongoose } = require('mongoose')
const app = express()

mongoose.connect(process.env.MONGODB_URL);

app.set('view engine', 'ejs');
app.set('views','views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(cookieParser());
app.use(session({
    secret: 'gamingHavenSecretForUserSession',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    },
    save: true,
  })
);
app.use(flash())

app.use((req,res,next)=>{
  if(req.session.loginSuccess === undefined){
    req.session.loginSuccess = false;
  }
  next();
})

app.use(shopRouter);

app.listen(port, console.log(`connected to port ${port}`));

app.get('/', async(req, res) => {
  // console.log(req.session.loginSuccess+' home route');
  try {
    const games = await getRandomGames(56);
    res.render('index', { loginSuccess: req.session.loginSuccess, games: games });
    // res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/signIn', (req, res) => {
  req.session.redirectUrl = req.headers.referer;
  const flashMessage = req.query.message;
  res.render('signIn',{messages : flashMessage});
});

// REGISTER

app.post('/register', async (req, res) => {
  const existingUser = await product.findOne({email: req.body.email})
  if(existingUser){
    const flashMessage = encodeURIComponent('User Already Exists');
    res.redirect(`/signIn?=${flashMessage}`)
  }
  else{
    let salt = await bcrypt.genSalt(saltRounds);
    let hashedPass = await bcrypt.hash(req.body.pass, salt);
  
    let user = {
      name: req.body.username,
      email: req.body.email,
      password: hashedPass,
    };
    const result = await newUser.insertMany([user]);
    const userId = result[0]._id;
    req.session.userId = userId;
    req.session.loginSuccess = true;
    res.redirect('/');
  }
});

// LOGIN

app.post('/login', async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.pass;

    const loginUser = await newUser.findOne({ name: username });

    if (loginUser) {
      // User found in the database
      req.session.loginSuccess = await bcrypt.compare(password, loginUser.password);

      if (req.session.loginSuccess) {
        req.session.userId = loginUser._id;
        req.session.userName = loginUser.name;
        // console.log("logged In");

        if (req.session.redirectUrl === undefined) {
          res.redirect('/');
        } else {
          res.redirect(req.session.redirectUrl);
        }
      } else {
        const flashMessage = encodeURIComponent('Invalid Details');
        res.redirect(`/signIn?=${flashMessage}`);
      }
    } else {
      // User not found in the database
      const flashMessage = encodeURIComponent('User not found');
      res.redirect(`/signIn?=${flashMessage}`);
    }
  } catch (error) {
    console.log(error);
    res.redirect('/signIn');
  }
});


// LOGOUT

app.get('/logout', (req, res) => {
  req.session.loginSuccess = false;
  req.session.userId = undefined;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
  });
});


// ADDING GAMES

app.get('/addgames',(req,res)=>{
  res.render('addgames')
})

app.post('/addgames',upload.single('img'),async(req,res)=>{
  let imgname=req.file.filename;
  let newGame = {
    name : req.body.gameName,
    sourceLink : req.body.srcLink,
    ImageName:imgname
  }
  await game.insertMany([newGame]);
  res.redirect('/addgames');
})

// GAMES

app.get('/games',async(req,res)=>{
  let gameData = await game.find({});
  res.render('games',{loginSuccess : req.session.loginSuccess , gameData : gameData});
})

app.get('/getImages/:name',async(req,res)=>{
  let {name} = req.params;
  var options = {
    root : path.join(__dirname+'/uploads'),
    dotfiles : 'deny',
    headers : {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  console.log('tried getting image files');
  await res.sendFile(name,options,(err)=>{
    if(err){
      console.log(err);
    }
  })
})

app.get('/playgame/:_id',async(req,res)=>{
  const id = req.params;
  let gameData = await game.findById(id);
  res.render('playgames',{gameData : gameData , loginSuccess : req.session.loginSuccess})
})

// module.exports = loginSuccess;

// GAME CARDS

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getRandomGames(pageSize) {
  try {
    const response = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: apiKey,
        page_size: pageSize,
        ordering: '-added',
      },
    });
    const games = response.data.results;
    const shuffeledGames = shuffleArray(games);
    return shuffeledGames;
  } catch (error) {
    console.error(error);
  }
}

// GAME LANDING PAGE

async function getDetailsByName(gameName) {
  try {
    const searchRes = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: apiKey,
        search: gameName,
        page_size: 1
      }
    });

    const game = searchRes.data.results[0];
    const gameId = searchRes.data.results[0].id;

    const detailsRes = await axios.get(`https://api.rawg.io/api/games/${gameId}`, {
      params: {
        key: apiKey
      }
    });

    const trailerRes = await axios.get(`https://api.rawg.io/api/games/${gameId}/movies`, {
      params: {
        key: apiKey
      }
    });

    const gameDetails = {
      name: game.name,
      description: detailsRes.data.description_raw,
      backgroundImage: game.background_image,
      releaseDate: game.released,
      platforms: game.parent_platforms,
      shortScreenshots: game.short_screenshots,
      reviews: game.ratings,
      tags: game.tags,
      genres: game.genres,
      trailers : trailerRes.data.results
    };

    return gameDetails;
    // return trailerRes.data.results;
  } catch (err) {
    console.error(err);
  }
}


app.get('/gameDetails/:gameName',async(req,res)=>{
  var gameName = req.params.gameName;
  var gameData = await getDetailsByName(gameName);
  res.render('landingPage',{gameData: gameData,loginSuccess: req.session.loginSuccess})
  // res.json(gameData);
})

// SEARCH BAR

async function searchDetailsByName(gameName) {
  try {
    const response = await axios.get('https://api.rawg.io/api/games', {
      params: {
        key: apiKey,
        search: gameName,
      },
    });
    const gameData = response.data.results;
    return gameData;
  } catch (error) {
    console.error(error);
  }
}

app.get('/searchGame/:gameName',async (req,res)=>{
  var gameName = req.params.gameName;
  var gameData = await searchDetailsByName(gameName);
  res.render('searchLanding',{gameData: gameData,loginSuccess: req.session.loginSuccess});
  // res.json(gameData);
})

// ECOMMERCE

app.get('/shop',async(req,res)=>{
  let products = await product.find({});
  products = shuffleArray(products);
  res.render('shop',{loginSuccess: req.session.loginSuccess,productData : products});
  // // res.json(products);
})

app.get('/shop/category/:category',async(req,res)=>{
  console.log('route hit');
  var prodCategory = req.params.category;
  console.log(prodCategory);
  let categorisedProducts = await product.find({category: prodCategory})
  products = shuffleArray(categorisedProducts);
  res.render('shop',{loginSuccess: req.session.loginSuccess, productData: categorisedProducts})
  // res.json(categorisedProducts);
})

app.get('/viewProduct/:name',async(req,res)=>{
  const prodName = req.params.name;
  var currUserID = null
  if(req.session.loginSuccess === true){
    currUserID = req.session.userId;
  }
  const prodData = await product
    .findOne({ name: prodName })
    .populate({
      path: 'author',
      select: '-password',
    })
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
        model : newUser,
        select: '-password',
      },
    });

  res.render('prodView',{loginSuccess: req.session.loginSuccess, prod : prodData ,currUserID : currUserID});
  // res.json(prodData);
})

// REVIEW HANDLING

app.post('/viewProduct/:name/addReview',async(req,res)=>{
  prodName = req.params.name
  const prod = await product.findOne({name : prodName})
  const rev = {
    rating : req.body.rating,
    comment : req.body.comment,
    author : req.session.userId
  }
  const newReview = new review(rev);
  const savedReview = await newReview.save();
  const reviewId =  savedReview._id;
  console.log(reviewId);
  prod.reviews.push(reviewId);
  prod.save();
  res.redirect(`/viewProduct/${prodName}`)
})

// Handling User Cart

app.get('/cart',async(req,res)=>{
  if(req.session.loginSuccess === true){
    const user = await newUser.findById(req.session.userId).populate({path : 'cart',model : product})
    // console.log(user);
    res.render('cart',{user : user,loginSuccess : req.session.loginSuccess})
  }
  else{
    const flashMessage = encodeURIComponent('Login To View Cart');
    res.redirect(`/signIn?message=${flashMessage}`);
  }
})

app.post('/viewProduct/:name/addToCart',async(req,res)=>{
  // console.log(req.session.loginSuccess);
  if(req.session.loginSuccess === true){
    const prod = await product.findOne({name: req.params.name})
    const user = await newUser.findById(req.session.userId)
    const prodId = prod._id;
    user.cart.push(prodId);
    await user.save()
    res.redirect(`/viewProduct/${req.params.name}`)
  }
  else{
    const flashMessage = encodeURIComponent('Login To Add Product To Cart');
    res.redirect(`/signIn?message=${flashMessage}`);
  }
})

app.post('/removeItem/:id', (req, res) => {
  const userId = req.session.userId;
  const productId = req.params.id;

  newUser.findOneAndUpdate(
    { _id: userId },
    { $pull: { cart: productId } },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.redirect('/cart')
    })
    .catch(err => {
      return res.status(500).json({ error: 'Internal server error' });
    });
});
