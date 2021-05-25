const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const config = require('./config/database')
const passport = require('passport');

mongoose.connect(config.database, {
    useNewUrlParser: true,
    useUnifiedTopology:true
});
let db = mongoose.connection;

// Check for DB errors
db.once('open', () => console.log("connected to mongodb"));
db.on('error', err => console.log(err));

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname,'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) =>{
    res.locals.messages = require('express-messages')(req, res);
    next();
})

// Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
})
// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles)=> {
        res.render('index', { 
            articles: articles
        }); 
    });
});   

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);


// Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log('Server started...');
});
