const app = require('express')()
const server = require('http').createServer(app)
const WebSocket = require('ws')
const cors = require('cors')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

app.use(cors())

const wss = new WebSocket.Server({ port: PORT })

wss.on('connection', (ws) => {
    console.log('Connected!')

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
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(targets))
                                console.log('sending data', targets)
                                clearTimeout(bombTimer)
                            }
                        })
                    }, 5000)
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
