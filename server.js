const app = require('express')()
const server = require('http').createServer(app)
const WebSocket = require('ws')
const PORT = 3000
const cors = require('cors')

app.use(cors())

const wss = new WebSocket.Server({ port: PORT })

wss.on('connection', function connection(ws) {
    console.log('Connected!')
    ws.on('movement', function incoming(data) {
        //check player movement here
    })
    ws.on('message', function incoming(data) {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState == WebSocket.OPEN) {
                client.send(data)
                console.log(data)
            }
        })
    })
})
