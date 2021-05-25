const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Str = require('@supercharge/strings');

// Bring in Models
let Article = require('../models/article');
let User = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
        title: 'Add Articles'
    });
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res)=> {
    Article.findById(req.params.id,(err, article)=> {
        if (article.author!=req.user._id){
            req.flash('danger', 'Not authorized');
            res.redirect('/');
        }
        else {
            res.render('edit_article', {
                title: 'Edit Article',
                article: article,
                pretty: true
            });
        }
    });
});

// Add Submit POST Route
router.post('/add',
    [
        check('title').isLength({ min: 1}).trim().withMessage('Title required'),
        check('body').isLength({ min: 1}).trim().withMessage('Body required')
    ], (req, res, next) => {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('add_article', {
            title: "Add Articles",
            errors: errors.mapped()
        });
    } else {
        article.save((err) => {
            if (err) {
                console.log(err);
                return;
            }
            req.flash('success', 'Article Added');
            res.redirect('/articles/add');
        });
    }

});

// Add Random Text
router.post('/addRandom', (req, res) => {
    let article = new Article();
    if (!req.user){
        req.flash('danger', 'Login to add random articles');
        res.redirect('/users/login');
    }
    else {

        article.title = Str.random(5);
        article.author = req.user._id;
        article.body = Str.random(100);

        article.save((err) => {
            if (err) {
                console.log(err);
                return;
            }
            else {
                req.flash('success', 'Random Article Added');
                res.redirect('/');
            }
        });
    }
});

// Add Edit POST Route
router.post('/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id};
    Article.update(query, article, (err) => {
        if (err) {
            console.log(err);
            return;
        }
        else {
            req.flash('success', 'Article updated');
            res.redirect('/');
        }
    });
});

// Delete request
router.delete('/:id', (req,res) => {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query = {_id:req.params.id};
    Article.findById(req.params.id, (err, article) => {
        if (article.author!=req.user._id) {
            res.status(500).send();
        }
        else {
            Article.deleteOne(query,() => {
                res.send();
            });
            req.flash('danger', 'Article deleted')
        }
    })
});

// Get Single Article
router.get('/:id', (req, res)=> {
    Article.findById(req.params.id,(err, article)=> {
        User.findById(article.author, (err, aaa) => {
            res.render('article', {
                article: article,
                author: aaa.name,
                pretty: true
            });
        })
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;

