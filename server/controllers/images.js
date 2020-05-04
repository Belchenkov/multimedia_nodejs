const fs = require('fs');
const mime = require('mime');
const gravatar = require('gravatar');

const Images = require('../models/images');

// set image file types
const IMAGE_TYPES = ['image/jpeg','image/jpg', 'image/png'];

// Show images gallery
exports.show = (req, res) => {
    Images.find()
        .sort('-created')
        .populate('user', 'local.email')
        .exec((error, images) => {
        if (error) {
            return res.status(400).send({
                message: error
            });
        }
        // Render galley
        res.render('images-gallery', {
            title: 'Images Gallery',
            images: images,
            gravatar: gravatar.url(
                images.email ,
                {s: '80', r: 'x', d: 'retro'},
                true
            )
        });
    });
};

exports.uploadImage = (req, res) => {
    let src;
    let dest;
    let targetPath;
    let targetName;
    const tempPath = req.file.path;

    console.log(req.file);
    //get the mime type of the file
    const type = mime.lookup(req.file.mimetype);
    // get file extension
    const extension = req.file.path.split(/[. ]+/).pop();

    // check support file types
    if (IMAGE_TYPES.indexOf(type) === -1) {
        return res.status(415).send('Supported image formats: jpeg, jpg, jpe, png.');
    }

    // Set new path to images
    targetPath = './public/images/' + req.file.originalname;

    // using read stream API to read file
    src = fs.createReadStream(tempPath);

    // using a write stream API to write file
    dest = fs.createWriteStream(targetPath);
    src.pipe(dest);

    // Show error
    src.on('error', err => {
        if (err) {
            return res.status(500).send({
                message: err
            });
        }
    });

    // Save file process
    src.on('end', () => {
        // create a new instance of the Images model with request body
        const image = new Images(req.body);

        // Set the image file name
        image.imageName = req.file.originalname;

        // Set current user (id)
        image.user = req.user;

        // save the data received
        image.save(error => {
            if (error) {
                return res.status(400).send({
                    message: error
                });
            }
        });

        // remove from temp folder
        fs.unlink(tempPath, err => {
            if (err) {
                return res.status(500).send('Woh, something bad happened here');
            }
            // Redirect to galley's page
            res.redirect('images-gallery');
        });
    });
};

// Images authorization middleware
exports.hasAuthorization = (req, res, next) => {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
