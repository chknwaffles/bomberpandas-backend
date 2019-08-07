'use strict'

module.exports = {
    getBombTargets: (row, col, fireLevel, id) => {
        let result = [
            'BOMB TARGETS', 
            `${id}`,
            { x: row, y: col}
        ]

        for(let i = fireLevel; i > 0; i--) {
            result.push({ x: row - fireLevel, y: col })
            result.push({ x: row, y: col - fireLevel })
            result.push({ x: row + fireLevel, y: col })
            result.push({ x: row, y: col + fireLevel })
        }
        return result
    }
}