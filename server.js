const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require('cors')
const session = require('express-session')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const User = require('./models/User')
const Game = require('./models/Game')
const SERVER_PORT = 4000

const expressWs = require('express-ws')(app)

//express routes
const UserRoutes = require('./routes/UserRoutes')
const createWaitingRooms = require('./controllers/WaitingRoomController')
const waitingRooms = createWaitingRooms()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({ secret: 'super secret cat', resave: false, saveUninitialized: true, cookie: { secure: false } }))

//MongoDB connection through mongoose
mongoose.connect('mongodb://localhost/bomberman', { useNewUrlParser: true})
.then(() => console.log('MongoDB connected!'))
mongoose.set('useCreateIndex', true)
// mongoose.set('useFindAndModify', false)
mongoose.Promise = global.Promise

//passport user auth
passport.use(User.createStrategy())
passport.serializeUser((user, done) => {
    console.log('serializing', user)
    done(null, user.id)
})
passport.deserializeUser((id, done) => {
    console.log('deserializing')
    console.log(id)
    User.findById(id, (err, user) => {
        if (err) console.log('error', err)
        done(err, user)
    })
})
app.use(passport.initialize())
app.use(passport.session())

app.use('/', require('./routes/UserRoutes'))

app.ws('/game', (ws, next) => {
    console.log('Game connected!')

    ws.on('message', (data) => {
        let dataObj = JSON.parse(data)

        switch(dataObj.type) {
            case 'B': {
                // send targets to explode
                let targetRow = (dataObj.x)
                let targetCol = (dataObj.y)
                let targets = [
                    'BOMB TARGETS',
                    { x: targetRow - 1, y: targetCol },
                    { x: targetRow, y: targetCol - 1 },
                    { x: targetRow, y: targetCol },
                    { x: targetRow + 1, y: targetCol },
                    { x: targetRow, y: targetCol + 1 },
                ]

                bombTimer = () => {
                    setTimeout(() => {
                        expressWs.getWss('/').clients.forEach(client => {
                            client.send(JSON.stringify(targets))
                            console.log('sending data', targets)
                            clearTimeout(bombTimer)
                        })
                    }, 4000)
                }

                bombTimer() 
                break
            }
            default: {
                console.log('message', dataObj)
            }
        }
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

app.ws('/play', (ws, req) => {    
    console.log('in play socket')
    // console.log('req', req)
    console.log(ws.upgradeReq)
    console.log('req passport', req.session.passport)
    console.log(req.isAuthenticated())
    passport.authenticate('local')(req, res, () => {
        console.log(req.user)
        waitingRooms.addConnection(ws, req.user, req.user.gameId)
    })

    ws.on('message', (data) => {
        //send message back here??? then emit to other clients in my game?
        let gameObj = JSON.parse(data)
        console.log(gameObj)
        // send back to other users inside game obj
        gameObj.users.forEach(user => {
            console.log('sending message to ' + user.username)
            waitingRooms.emitMessage(ws, user.username, gameObj)
        })
    })

    ws.on('close', (code, reason) => {
        waitingRooms.removeConnection(ws, req.user)
    })
})

// chatSocket.on('connection', (ws) => {
//     console.log('Chat connected!')

//     ws.on('message', (data) => {
//         let dataObj = JSON.parse(data)

//         if (dataObj.type === 'message') {
//             wss.clients.forEach(client => {
//                 if (client !== ws && client.readyState === WebSocket.OPEN) {
//                     client.send(JSON.stringify(data))
//                     console.log('sending message back', data)
//                 }
//             })
//         }
//     })
// })

const test = app.listen(SERVER_PORT, () => {
    console.log('listening on port', test.address().port)
})

module.exports = app
