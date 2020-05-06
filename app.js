// Import basic modules
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const flash = require('connect-flash');

//import multer
const multer = require('multer');
const upload = multer({
    dest:'./public/uploads/',
    limits: {
        fileSize: 10000000,
        files:1
    }
});

// Controllers
const index = require('./server/controllers/index');
const auth = require('./server/controllers/auth');
const comments = require('./server/controllers/comments');
const videos = require('./server/controllers/videos');
const images = require('./server/controllers/images');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// Database configuration
const config = require('./server/config/config.js');

// connect to our database
mongoose.connect(config.url);

// Check if MongoDB is running
mongoose.connection.on('error', () => {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

// Passport configuration
require('./server/config/passport')(passport);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

// Setup public directory
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
// secret for session
app.use(session({
    secret: 'super_puper_secret',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        url: config.url,
        collection : 'sessions'
    })
}));

// Init passport authentication
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Application Routes
// Index Route
app.get('/', index.show);

// Routes for Auth
app.get('/login', auth.signin);
app.post('/login', passport.authenticate('local-login', {
    //Success go to Profile Page / Fail go to login page
    successRedirect : '/profile',
    failureRedirect : '/login',
    failureFlash : true
}));
app.get('/signup', auth.signup);
app.post('/signup', passport.authenticate('local-signup', {
    //Success go to Profile Page / Fail go to Signup page
    successRedirect : '/profile',
    failureRedirect : '/signup',
    failureFlash : true
}));
app.get('/profile', auth.isLoggedIn, auth.profile);
// Logout Page
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// Routes for comments
app.get('/comments', comments.hasAuthorization, comments.list);
app.post('/comments', comments.hasAuthorization, comments.create);

// Routes for videos
app.get('/videos', videos.hasAuthorization, videos.show);
app.post('/videos', videos.hasAuthorization, upload.single('video'), videos.uploadVideo);

// Routes for images
app.post('/images', images.hasAuthorization, upload.single('image'),
    images.uploadImage);
app.get('/images-gallery', images.hasAuthorization, images.show);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + server.address().port);
});
