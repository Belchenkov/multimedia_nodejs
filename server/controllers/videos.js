const fs = require('fs');
const mime = require('mime');
const gravatar = require('gravatar');

// get video model
const Videos = require('../models/videos');
// set image file types
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/ogv'];
