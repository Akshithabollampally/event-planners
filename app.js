const express = require('express');
const app = express();
const mongoose=require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override')
const passport = require('passport');
const LocalStrategy = require('passport-local');

const {isLoggedIn}=require('./middleware');

const userRoutes=require('./routes/users');
const { Console } = require('console');

const User = require('./models/user');
const Blood = require('./models/blood');

mongoose.connect('mongodb://127.0.0.1:27017/omsri', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })
    

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public/'));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}


app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/',userRoutes)

//routes

app.get('/rahul',async(req, res)=>{
    res.render('home1.ejs')
})

app.get('/akshitha',async(req, res)=>{
    res.render('home1.ejs')
})



app.post('/products',isLoggedIn, async (req, res) => {
    const newProduct = new Blood(req.body);
    await newProduct.save();

    res.redirect(`/akshitha`)
})


app.get('/done',async(req, res)=>{
    res.render('home1')
})


app.get('/bloods', async (req, res) => {

  try {
    // Get the current user ID from the request object
    const userId = req.user._id;

    // Find all posts that have the user's ID as the userId field
    const bloods = await Blood.find({ userId: userId });

    // Render the posts.ejs template with the posts and user object
    res.render('bloods/index', { bloods: bloods, user: req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send('An error occurred');
  }
})


app.get('/bloods/new',isLoggedIn, (req, res) => {
      // Get the current user ID from the request object
  const userId = req.user._id;

    res.render('bloods/new', { user: req.user })
})

app.post('/bloods',isLoggedIn, async (req, res) => {
    const newProduct = new Blood(req.body);
    await newProduct.save();
    res.redirect(`/bloods/${newProduct._id}`)
})

app.get('/bloods/:id',isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const blood = await Blood.findById(id)
    res.render('bloods/show', { blood })
})


app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})


