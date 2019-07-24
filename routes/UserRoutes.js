const UserController = require('../controllers/UserController')
const User = require('../models/User');

module.exports = app => {
    // app.route('/users').get(UserController.getUsers)
    // app.route('/user/:id').get(UserController.getUser)
    app.route('/joingame').post(UserController.joinGame)
    app.route('/register').post(UserController.createUser)
    app.route('/login').post(UserController.authenticateUser)
}