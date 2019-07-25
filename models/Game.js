'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GameSchema = new Schema({
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: String
})

GameSchema.pre('save', function(next) {
    const game = this;

    //before saving user to game check to see if there are already 4 people there
    
})

module.exports = mongoose.model('Game', gameSchema)