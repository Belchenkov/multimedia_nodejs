// Show home screen
exports.show = (req, res) => {
    res.render('index', {
        title: 'Multimedia Application',
        callToAction: 'An easy way to upload and manipulate files with Node.js'
    });
};
