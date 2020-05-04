const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const userSchema = mongoose.Schema({
    // Using local for Local Strategy Passport
    local: {
        name: String,
        email: String,
        password: String,
    }
});

// Encrypt Password
userSchema.methods.generateHash = password => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Verify if password is valid
userSchema.methods.validPassword = password => {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
