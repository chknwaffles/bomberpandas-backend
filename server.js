const http = require('http')
const express = require('express')
const expressWs = require('express-ws')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const bodyParser = require("body-parser")
const cors = require('cors')
const User = require('./models/User')
const Game = require('./models/Game')

const SERVER_PORT = 4000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const expressWss = expressWs(app, server)
//MongoDB connection through mongoose
mongoose.connect('mongodb://localhost/bomberman', { useNewUrlParser: true})
.then(() => console.log('MongoDB connected!'))
mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise

//express routes
// const GameRoutes = require('./routes/GameRoutes');
const UserRoutes = require('./routes/UserRoutes')

GameRoutes(app)
UserRoutes(app)

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
                        expressWss.getWss('/').clients.forEach(client => {
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

app.get('/play', (req, res, next) => {
    User.findOne({ username }, (err, user) => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Internal error please try again' })
        } else if (!user) {
            res.status(401).json({ error: 'Must be logged in to play!'})
        } else {
            // add user to game room if there is one with available players
            // if not, let's create a game room
            Game.findOneAndUpdate({ status: 'open' }, { $push: { users: user } }, (err, game) => {
                if (game === null) {
                    let newGame = new Game({ users: [user], status: 'open' })
                    newGame.save((err, savedGame) => {
                        if (err) {
                            console.log(err)
                            return res.status(500)
                        } else {
                            return res.json(game)
                        }
                    })
                } else {
                    // if found, let's check if it's has 3 players and you're the fourth to start the game!
                    if (game.users.length === 1) {
                        //send message to those clients that the game is ready to start
                        game.update({ status: 'closed' })
                    }
                    return res.json(game)
                    // send the game to front end then send the message back to 
                }
            })
        }
    }) 
})  

app.ws('/play', (ws, req) => {
    console.log('In waiting room!')

    ws.on('message', (data) => {
        //send message back here??? then emit to other clients in my game?
        console.log(JSON.parse(data))
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

app.listen(SERVER_PORT, () => {
    console.log('connected to server_port')
})

