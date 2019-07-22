'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gameSchema = new Schema({
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: String
})

module.exports = mongoose.model('Game', gameSchema)