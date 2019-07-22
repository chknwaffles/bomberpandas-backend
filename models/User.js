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

UserSchema.pre('save', next => {
    this.password = bcrypt.hashSync(this.password, 10)
    next()
})

module.exports = mongoose.model('User', UserSchema)