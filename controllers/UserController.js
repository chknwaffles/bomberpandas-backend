'use strict'
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Game = mongoose.model('Game')

exports.getUsers = (req, res) => {

}

exports.getUser = (req, res) => {

}

exports.createUser = (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    user.save((err, user) => {
        if (err) res.send(err)
        res.json(user)
    })
}

exports.authenticateUser = (req, res) => {
    const { username, password } = req.body
    User.findOne({ username }, (err, user) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal error please try again' })
        } else if (!user) {
            res.status(401).json({ error: 'Incorrect email or password' })
        } else {
            user.isCorrectPassword(password, function(err, same) {
                if (err) {
                    res.status(500).json({ error: 'Internal error please try again'})
                } else if (!same) {
                    res.status(401).json({ error: 'Incorrect email or password'})
                } else {
                    res.json(user)
                }
            })
        }
    })
}