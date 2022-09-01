if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const morgan = require('morgan')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');
const ExpressError = require('./utils/ExpressError');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const usersRoute = require('./router/users')
const campgroundRoute = require('./router/campgrounds')
const reviewRoute = require('./router/reviews');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', err => {
    console.log(err);
});
db.once("open", ()=> {
    console.log("Database connected");
})

const app = express();
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'secret';
const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
});

store.on('error', function (e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(mongoSanitize());

app.use((req, res, next) => {
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    // res.locals.returnTo = '/campgrounds'
    // if(req.originalUrl.includes('new') || req.originalUrl.includes('edit')) {
    //     res.locals.returnTo = req.originalUrl;
    // }
    // console.log(req.session); 
    next();
})

app.use('/', usersRoute)
app.use('/campgrounds', campgroundRoute);
app.use('/campgrounds/:id/reviews', reviewRoute);

app.get('/', (req, res)=> {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "something went wrong";
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`PORT ${port}`);
})

