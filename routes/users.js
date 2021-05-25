const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const passport = require('passport');


// Bring in User Model
let User = require('../models/user');

// Register Form
router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', [
    check('name').isLength({ min: 1}).trim().withMessage('Name required'),
    check('email').isLength({ min: 1}).trim().withMessage('Email required'),
    check('email').isEmail().trim().withMessage('Invalid Email'),
    check('username').isLength({ min: 1}).trim().withMessage('Username required'),
    check('password').isLength({ min: 1}).trim().withMessage('Password required'),
    check('password2').custom((value, { req }) => value===req.body.password).withMessage('Passwords do not match')
    ], (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('register', {
            errors: errors.mapped()
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (!err){
                    newUser.password = hash;
                    newUser.save((err) => {
                        if (!err) {
                            req.flash('success', 'You are now registered and can log in')
                            res.redirect('/users/login')
                        }
                    })
                }
            })
        })
    }
});

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { 
        successRedirect: '/',
        failureRedirect: '/users/login', 
        failureFlash: true
    })(req, res, next);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
})

module.exports = router;
