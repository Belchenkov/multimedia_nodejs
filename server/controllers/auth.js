const gravatar = require('gravatar');
const passport = require('passport');

// Signin GET
exports.signin = (req, res) => {
    // List all Users and sort by Date
    res.render('login', {
        title: 'Login Page',
        message: req.flash('loginMessage')
    });
};

// Signup GET
exports.signup = (req, res) => {
    // List all Users and sort by Date
    res.render('signup', {
        title: 'Signup Page',
        message: req.flash('signupMessage')
    });
};

// Profile GET
exports.profile = (req, res) => {
    // List all Users and sort by Date
    res.render('profile', {
        title: 'Profile Page',
        user : req.user,
        avatar:gravatar.url(
            req.user.email ,
            {s: '100', r: 'x', d: 'retro'},
            true
        )
    });
};

// Logout
exports.logout = () => {
    req.logout();

    res.redirect('/');
};

// check if user is logged in
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    res.redirect('/login');
};
