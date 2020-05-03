const gravatar = require('gravatar');

// Comments model
const Comments = require('../models/comments');

// List Comments
exports.list = function(req, res) {
    // List all comments and sort by Date
    Comments.find()
        .sort('-created')
        .populate('user', 'local.email')
        .exec((error, comments) => {
            if (error) {
                return res.send(400, {
                    message: error
                });
            }

            res.render('comments', {
                title: 'Comments Page',
                comments: comments,
                gravatar: gravatar.url(
                    comments.email ,
                    {s: '80', r: 'x', d: 'retro'},
                    true
                )
            });
        });
};

// Create Comments
exports.create = (req, res) => {
    const comments = new Comments(req.body);
    // Set current user (id)
    comments.user = req.user;
    // save the data received
    comments.save(error => {
        if (error) {
            return res.send(400, {
                message: error
            });
        }
        // Redirect to comments
        res.redirect('/comments');
    });
};

// Comments authorization middleware
exports.hasAuthorization = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    res.redirect('/login');
};
