var app = require('express')()
var mongoose = require('mongoose')
var bodyParser = require("body-parser")
var cors = require('cors')
var session = require('express-session')
var passport = require('passport')
var User = require('./models/User')
var Game = require('./models/Game')
var SERVER_PORT = 4000

const wsOptions = {
    verifyClient: (info, done) => {
        sessionParser(info.req, {}, () => {
            console.log(info.req.session)
            done(info.req.session)
        })
    }
}
const expressWs = require('express-ws')(app, undefined, { wsOptions: wsOptions })

//express routes
var UserRoutes = require('./routes/UserRoutes')
var createWaitingRooms = require('./controllers/WaitingRoomController')
var waitingRooms = createWaitingRooms()
var gameController = require('./controllers/GameController')

const sessionParser = session({ 
    secret: 'super secret cat', 
    resave: false, 
    saveUninitialized: false, 
    cookie: { secure: false } 
})

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(sessionParser)

//passport user auth
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use(passport.initialize())
app.use(passport.session())

//MongoDB connection through mongoose
mongoose.connect('mongodb://localhost/bomberman', { useNewUrlParser: true })
.then(() => console.log('MongoDB connected!'))
mongoose.set('useCreateIndex', true)

app.use('/', require('./routes/UserRoutes'))

app.ws('/game', (ws, req) => {
    console.log('Game connected!')
    console.log('req user connected', req.session.passport.user)
    
    ws.on('message', (data) => {
        let dataObj = JSON.parse(data)
        console.log(dataObj)
        switch(dataObj.type) {
            case 'B': {
                // send targets to explode
                let targetRow = (dataObj.x)
                let targetCol = (dataObj.y)
                let targets = gameController.getBombTargets(targetRow, targetCol, dataObj.powerups.fire, dataObj.id)

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

app.ws('/play', (ws, req) => {    
    console.log('req user connected')
    console.log(req.passport.user)
    console.log(req.user)
    ws.on('message', (data) => {
        //send message back here??? then emit to other clients in my game?
        let gameObj = JSON.parse(data)
        console.log(gameObj)
        console.log('game data received!')
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

const test = app.listen(SERVER_PORT, () => {
    console.log('listening on port', test.address().port)
})

module.exports = app
