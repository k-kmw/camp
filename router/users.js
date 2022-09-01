const express = require('express');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const router = express.Router();
const {checkReturnTo} = require('../middleware');
const users = require('../controllers/users')

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register))

router.get('/login', (req, res) => {
    if(req.query.returnTo) {
        console.log(req.query.returnTo);
        req.session.returnTo = req.query.returnTo;
    }
    res.render('users/login')
})

router.post('/login', checkReturnTo, 
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    users.login)

router.get('/logout', users.logout)

module.exports = router;