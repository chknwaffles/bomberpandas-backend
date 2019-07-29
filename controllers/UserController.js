'use strict'
const mongoose = require('mongoose')
const passport= require('passport')
const User = mongoose.model('User')

exports.createUser = (req, res) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            console.log('error while user register!', err)
            return next(err)
        }
        res.json(user)
    })
}

exports.authorizeUser = (req, res) => {
    passport.authenticate('local')(req, res, () => {
        res.json(req.user)
    })
}