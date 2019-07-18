const app = require('express')()
const server = require('http').createServer(app)
const WebSocket = require('ws')
const PORT = 3000
const cors = require('cors')

app.use(cors())

const wss = new WebSocket.Server({ port: PORT })

wss.on('connection', (ws) => {
    console.log('Connected!')

    ws.on('message', (data) => {
        console.log('incoming data', data)
        console.log('testing data', data.type)
        console.log('testing data2', data.x)

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data)
                console.log('sending data', data)
            }
        })
        switch(data.type) {
            case 'Bomb': {
                // startBombTimer()
                
                // setTimeout(() => {
                //     wss.clients.forEach(client => {
                //         if (client.readyState === WebSocket.OPEN) {
                //             client.send(data)
                //             console.log(data)
                //         }
                //     })
                // }, 3000)
                break;
            }
        }
        
    })
})
