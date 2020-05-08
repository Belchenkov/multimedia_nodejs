const fs = require('fs');
const mime = require('mime');
const gravatar = require('gravatar');

// get video model
const Videos = require('../models/videos');
// set image file types
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/ogv'];

// List Videos
exports.show = (req, res) => {
    Videos.find()
        .sort('-created')
        .populate('user', 'local.email')
        .exec((error, videos) => {
            if (error) {
                return res.status(400).send({
                message: error
            });
        }

        // Render result
        console.log(videos);
        res.render('videos', {
            title: 'Videos Page',
            videos: videos,
            gravatar: gravatar.url(
                videos.email ,
                {s: '80', r: 'x', d: 'retro'}, true
            )
        });
    });
};

// Create Videos
exports.uploadVideo = function(req, res) {
    let src;
    let dest;
    let targetPath;
    let targetName;
    console.log(req);
    const tempPath = req.file.path;

    //get the mime type of the file
    const type = mime.lookup(req.file.mimetype);
    // get file extension
    const extension = req.file.path.split(/[. ]+/).pop();

    // check support file types
    if (VIDEO_TYPES.indexOf(type) === -1) {
        return res.status(415).send('Supported video formats: mp4, webm, ogg, ogv');
    }

    // Set new path to images
    targetPath = './public/videos/' + req.file.originalname;

    // using read stream API to read file
    src = fs.createReadStream(tempPath);

    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

    // Show error
    src.on('error', error => {
        if (error) {
            return res.status(500).send({
                message: error
            });
        }
    });

    // Save file process
    src.on('end', () => {
        // create a new instance of the Video model with request body
        const video = new Videos(req.body);

        // Set the video file name
        video.videoName = req.file.originalname;

        // Set current user (id)
        video.user = req.user;

        // save the data received
        video.save(error => {
            if (error) {
                return res.status(400).send({
                    message: error
                });
            }
        });

        // remove from temp folder
        fs.unlink(tempPath, err => {
            if (err) {
                return res.status(500).send({
                    message: err
                });
            }
            // Redirect to galley's page
            res.redirect('videos');
        });
    });
};

// Videos authorization middleware
exports.hasAuthorization = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    res.redirect('/login');
};
