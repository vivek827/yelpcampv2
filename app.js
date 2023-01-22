if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
console.log(process.env.cloud_name) 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const Flash = require('connect-flash');
const Joi = require('joi')
const CatchAsync = require('./utils/CatchAsync')
const Expresserror = require('./utils/Expresseror')
const {campgroundSchema, reviewSchema} = require('./schema.js')
const methodOverride = require('method-override');
mongoose.set('strictQuery', true);

const Campground = require('./models/campground');
const Review = require('./models/review')
//below three are the required routes
const campgrounds = require('./routes/campgrounds')
const userRouter = require('./routes/user')
const reviews = require('./routes/reviews')

const passport = require('passport')
const localStragy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')

const User = require('./models/user');
const MongoDBStore = require('connect-mongo')(session);
const dbURL = process.env.DBURL


mongoose.connect(dbURL)
.then(() => {
    console.log('Database Successfully Connected')
})
.catch((err) => {
    console.log('Oops...! Something went wrong')
    console.log(err)
})

const app = express();

const store = new MongoDBStore({
    url: dbURL,
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e) {
    console.log('session is unabale to connect')
    console.log(e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
}


app.use(session(sessionConfig))
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(Flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStragy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//app.get('/fakeuser', async (req, res) => {
//    const user = new User({email: 'vivek@gmail.com', username: 'Vickdon'})
//    const newUser = await User.register(user, 'chicken')
//   res.send(newUser)
//})

app.use('/', userRouter)
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews)
app.use(express.static(path.join(__dirname, 'public')))




app.use('/', (req, res) => {
    res.render('home')
})



app.all('*', (req, res, next) => {
    next(new Expresserror('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'oh, something went wrong...!'
    res.status(statusCode).render('error', {err});
})



app.listen('3000', () => {
    console.log('Listening on port 3000')
} );

