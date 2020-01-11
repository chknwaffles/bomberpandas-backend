'use strict'

module.exports = function createWaitingRooms() {
    let rooms = {}

    return {
        // addUser: (user, gameId) => {
        //     rooms[gameId].push({ username: })
        // },
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
        printRoom: (gameId) => {
          rooms[gameId].forEach((player, i) => console.log('player ', i, player.username))  
        },
        createRoom: (gameId) => {
            rooms[gameId] = []
        }
    }
}