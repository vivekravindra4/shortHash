const mongoose = require('mongoose');

const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        trim: true, // removes the begginning and trailing white spaces
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                return validator.isEmail(value);
            },
            message: 'the email id is incorrect'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 128
    },
    mobile: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return validator.isNumeric(value) && validator.isLength(value, {min: 10, max: 10});
            },
            message: 'should be 10 digits'
        }
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
})

userSchema.pre('save',function(next){
    let user = this;
    if(user.isModified('password')) {
        bcrypt.genSalt(10)
        .then((salt) => {
            bcrypt.hash(user.password, salt)
            .then((hashedPassword) => {
                user.password = hashedPassword;
                next();
            });
        });
    } else {
        next();
    }
})

userSchema.statics.findByToken = function(token) {
    let User = this;
    let tokenData;
    try {
        tokenData = jwt.verify(token,'supersecret');
        // Decoding // jwt.verify(TOKEN, SIGNATURE);
    } catch(e) {
        return Promise.reject(e);
    }
    return User.findOne({'_id': tokenData._id, 'tokens.token': token});
}

userSchema.methods.toJSON = function() {
    return _.pick(this, ['_id','username','email','mobile']);
}

userSchema.methods.generateToken = function() {
    let tokenData = {
        _id: this._id
    }

    let generatedTokenInfo = {
        access: 'auth',
        token: jwt.sign(tokenData, 'supersecret')
        // Encoding // jwt.sign(USER_DATA, SIGNATURE)
    }

    this.tokens.push(generatedTokenInfo);
    return this.save().then((user) => {
        return generatedTokenInfo.token;
    })
}

const User = mongoose.model('User',userSchema);

module.exports = {
    User
}