//load in environment variables:
if (process.env.NODE_ENV !== 'production') {
    // load in all environment variables from .env file and set them in process.env
    require('dotenv').config()
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    // find user by email
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [];

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
// setup basics of passport
app.use(passport.initialize());
// to store variables to be persisted across the session
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name });
})

app.get('/user-details', checkAuthenticated, (req, res) => {
    res.render('user-details.ejs', {
        name: req.user.name,
        email: req.user.email,
        id: req.user.id
    })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

// use passport authentication middleware
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (reg, res) => {
    res.render('register.ejs')
})

//create new user with correct hashed password
app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        // correct hashed password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    // console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut(); // clean the session and log user out
    res.redirect('/login');
})

app.get('*', (req, res) => {
    res.render('404Page.ejs')
})

// middleware function - use it for not logged in users so they cant insert http://localhost:3000/
function checkAuthenticated(req, res, next) {
    // isAuthenticated is a function of 'passport'. 
    // returns true if there is authenticated user, false if not 
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// middleware function - use it for logged in users so they cant insert http://localhost:3000/login/
function checkNotAuthenticated(req, res, next) {
    // isAuthenticated is a function of 'passport'. 
    // returns true if there is authenticated user, false if not 
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

app.listen(3000);