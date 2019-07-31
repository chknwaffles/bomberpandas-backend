'use strict'

module.exports = {
    getBombTargets: (row, col, fireLevel, id) => {
        let result = [
            'BOMB TARGETS', 
            `${id}`,
            { x: row - 1, y: col },
            { x: row, y: col - 1 },
            { x: row, y: col},
            { x: row + 1, y: col },
            { x: row, y: col + 1}
        ]
        if (fireLevel > 1) {
            for(let i = fireLevel; i > 1; i--) {
                result.push({ x: row - fireLevel, y: col })
                result.push({ x: row, y: col - fireLevel })
                result.push({ x: row + fireLevel, y: col })
                result.push({ x: row, y: col + fireLevel })
            }
        }
        return result
    }
}