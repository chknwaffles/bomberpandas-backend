'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    posX: Number,
    posY: Number,
    placedBomb: Boolean,
    onBomb: Boolean,
    wins: Number
})

UserSchema.pre('save', function(next) {
    const user = this;
    console.log('what is this???', this)
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })

    console.log('in pre save', user)
    console.log(user.password)
})

UserSchema.methods.isCorrectPassword = function(password, callback) {
    bcrypt.compare(password, this.password, (err, same) => {
        err ? callback(err) : callback(err, same)
    })
}

module.exports = mongoose.model('User', UserSchema)