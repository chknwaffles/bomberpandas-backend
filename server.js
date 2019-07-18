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
        let dataObj = JSON.parse(data)

        switch(dataObj.type) {
            case 'bomb': {
                // send targets to explode
                // 
                let targetRow = (dataObj.x / 50)
                let targetCol = (dataObj.y / 50)
                let targets = [
                    'BOMB TARGETS',
                    { x: targetRow - 1, y: targetCol },
                    { x: targetRow, y: targetCol - 1 },
                    { x: targetRow, y: targetCol },
                    { x: targetRow, y: targetCol + 1 },
                    { x: targetRow + 1, y: targetCol },
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
