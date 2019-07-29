'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Player = new Schema({ username: String, x: Number, y: Number, placedBomb: Boolean, onBomb: Boolean, gameId: String})
const GameSchema = new Schema({
    users: [Player],
    status: String
})

module.exports = mongoose.model('Game', GameSchema)