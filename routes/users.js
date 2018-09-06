const express = require('express');
const mongoose = require('mongoose');

const { User } = require('../models/user');
const { authenticateUser } = require('../middlewares/authentication');
const _ = require('lodash');

const router = express.Router();

router.get('/',(req,res) => {
    User.find()
    .then((user) => {
        res.send(user);
    })
    .catch((err) => {
        res.send(err);
    })
})

router.post('/',(req,res) => {
    let body = _.pick(req.body, ['username','email','password','mobile']);
    let user = new User(body);
    
    user.save()
    .then((user) => {
        return user.generateToken();
    })
    .then((token) => {
        res.header('x-auth',token).send(user);
    })
    .catch((err) => {
        res.status(404).send(err);
    })
})

router.get('/profile', authenticateUser, (req,res) => {
    res.send(req.locals.user);
})

module.exports = {
    usersRouter: router
}