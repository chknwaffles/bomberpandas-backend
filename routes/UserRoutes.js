const passport = require('passport')
const User = require('../models/User')
const router = require('express').Router()

router.post('/register', (req, res, next) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            return next(err)
        } else {
            passport.authenticate('local')
            res.json(user)
        }
    })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log(req.session.passport)
    res.json(req.user)
})

router.get('/logout', (req, res) => {
    req.logout()
    console.log('req user', req.user)
    console.log('logged out!')
})

module.exports = router