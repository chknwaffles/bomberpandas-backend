var app = require('express')()
var http = require('http').Server()
var io = require('socket.io')(http)
var session = require('express-session')
var mongoose = require('mongoose')
var MongoDBStore = require('connect-mongodb-session')(session)
var bodyParser = require("body-parser")
var cors = require('cors')

var User = require('./models/User')
var Game = require('./models/Game')
var port = process.env.PORT || 4000
//express routes
var UserRoutes = require('./routes/UserRoutes')
var gameController = require('./controllers/GameController')
var bombTimer

var store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'mySessions',
    useUnifiedTopology: true
})

store.on('error', function(error) {
    console.log(error)
})

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
    secret: 'boidonteven',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true
}))

//MongoDB connection through mongoose
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
.then(() => console.log('MongoDB connected!'))
mongoose.set('useCreateIndex', true)

app.use('/', require('./routes/UserRoutes'))

io.sockets.on('connection', function (socket) {

    socket.on('adduser', username => { 
        // // store the username in the socket session for this client
		// socket.username = username;
		// // store the room name in the socket session for this client
		// socket.room = 'room1';
		// // add the client's username to the global list
		// usernames[username] = username;
		// // send client to room 1
		// socket.join('room1');
		// // echo to client they've connected
		// socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// // echo to room 1 that a person has connected to their room
		// socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		// socket.emit('updaterooms', rooms, 'room1');
    })

    socket.on('game', game => {
        socket.join(game)
    })

    socket.on('local-game', game => {
        socket.join('local-game')
        console.log('joined local game!')
    })

    socket.on('senddata', data => {
        //need to grab data on player movement/bombs

        //emit it to them back
        //io.sockets.in(socket.room).emit('updategame', socket.username, data)
    })

    socket.on('sendlocal', data => {
        if (data.type === 'B') {
            let tRow = data.x
            let tCol = data.y
            let targets = gameController.getBombTargets(tRow, tCol, data.powerups.fire, data.id)
            bombTimer = setTimeout(() => {
                io.sockets.in('local-game').emit('bombmsg', targets)
            }, 4000)
        }
    })

    socket.on('updategame', data => {

    })

    socket.on('disconnect', reason => {
        console.log('user disconnected!')
    })
})

app.post('/joingame', (req, res) => {
    const { username } = req.body
    User.findOne({ username }, (err, user) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal error please try again' })
        } else if (!user) {
            res.status(401).json({ error: 'Must be logged in to play!'})
        } else {
            // add user to game room if there is one with available players
            // if not, let's create a game room
            Game.findOne({ users: { $nin: [user] }, status: 'open' }, (err, game) => {
                if (err) console.error(err)
                let newPlayer = { username: user.username, x: 0, y: 0, placedBomb: false, onBomb: false, gameId: null }

                if (game === null || game === undefined) {
                    let newGame = new Game({ users: [newPlayer], status: 'open' })
                    newGame.save((err, savedGame) => {
                        if (err) {
                            console.log(err)
                            res.status(500)
                        } else {
                            console.log(user.username + ' is making new game!')
                            waitingRooms.createRoom(savedGame.id)
                            user.gameId = savedGame.id
                            user.save()
                            waitingRooms.printRoom(savedGame.id)
                            res.json(savedGame)
                        }
                    })
                } else {
                    game.status = 'closed'
                    game.users.push(newPlayer)
                    game.save()
                    user.game = game
                    user.save()
                    waitingRooms.emitMessage(game.id, user, game)
                    res.json(game)
                }
            })
        }
    }) 
})  

// app.ws('/play', (ws, req) => {    
//     console.log('req user connected')
//     console.log(req.passport.user)
//     console.log(req.user)
//     ws.on('message', (data) => {
//         //send message back here??? then emit to other clients in my game?
//         let gameObj = JSON.parse(data)
//         console.log(gameObj)
//         console.log('game data received!')
//         // send back to other users inside game obj
//         gameObj.users.forEach(user => {
//             console.log('sending message to ' + user.username)
//             waitingRooms.emitMessage(ws, user.username, gameObj)
//         })
//     })

//     ws.on('close', (code, reason) => {
//         waitingRooms.removeConnection(ws, req.user)
//     })
// })

http.listen(port, () => {
    console.log('listening on *:', port)
})

module.exports = app
