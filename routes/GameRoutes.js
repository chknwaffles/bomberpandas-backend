const GameController = require('../controllers/GameController')
const Game = require('../models/Game');

module.exports = app => {
    app.route('/opengame').get(GameController.getOpenRoom)
}