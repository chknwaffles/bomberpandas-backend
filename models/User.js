'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new Schema({
    status: String,
    posX: Number,
    posY: Number,
    placedBomb: Boolean,
    onBomb: Boolean,
    wins: Number,
    game: {
        type: Schema.Types.ObjectId,
        ref: 'Game'
    }
})

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)