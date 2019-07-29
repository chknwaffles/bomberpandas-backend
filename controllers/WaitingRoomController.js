'use strict'

module.exports = function createWaitingRooms() {
    let rooms = {}

    return {
        addConnection: (ws, user, gameId) => {
            console.log(user)
            console.log(gameId)
            if (user !== undefined) {
                rooms[gameId].push({username: user.username, socket: ws})
                console.log(`added ${user.username} to room ${gameId}`)
            }
        },
        emitMessage: (gameId, user, msg) => {
            if (rooms[gameId] !== undefined) {
                rooms[gameId].forEach(player => {
                    if (user.username !== player.username) {
                        console.log('sending to ' + user.username)
                        user.socket.send(JSON.stringify(msg))
                    }
                })
            } else {
                console.error('User does not exist')
            }
        },
        printList: () => {
            console.log(rooms)
        },
        createRoom: (gameId) => {
            rooms[gameId] = []
        }
    }
}