
const express = require('express')
const router = express.Router();
const CatchAsync = require('../utils/CatchAsync')
const User = require('../models/user');
const passport = require('passport');
const review = require('../models/review');
const campground = require('../models/campground');


router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', CatchAsync(async (req, res, next) => {
    try{
      const {username, email, password} = req.body
      const user = new User({username, email})
      const registeredUser = await User.register(user, password)
      req.login(registeredUser, function(err) {
        if(err) {return next(err)}
        req.flash('success', 'Successfully logged in the user')
        res.redirect('/campgrounds')
      })
    } catch(err) {
        req.flash('error' ,err.message)
        res.redirect('/register')
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectURL = req.session.returnTo || 'campgrounds'
    res.redirect(redirectURL);
})

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if(err) {
            req.flash('error', 'oops something went wrong, please try again laterS')
        }
        req.flash('success', 'Successfully logged you out')
        res.redirect('/campgrounds')
    });
})

module.exports = router;