const mongoose = require('mongoose')

const gameSchema = new Schema({
    players: [{posX: Number, posY: Number, placedBomb: Boolean }],
    status: String
})

const Game = mongoose.model('Game', gameSchema)

export default Game