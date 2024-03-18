import fs from 'fs'

import { utilService } from './util.service.js'
export const bugService = {
    query,
    // getById,
    // remove,
    save
}

const bugs = utilService.readJsonFile('data/bugs.json')

function query() {
    return Promise.resolve(bugs)
}

// function getById(id) {
//     const car = cars.find(car => car._id === id)
//     if (!car) return Promise.reject('Car does not exist!')
//     return Promise.resolve(car)
// }

// function remove(id) {
//     const carIdx = cars.findIndex(car => car._id === id)
//     cars.splice(carIdx, 1)
//     return _saveBugsToFile()

// }

function save(bug) {
    if (bug._id) {
        const bugIdx = bugs.findIndex(_bug => _bug._id === bug._id)
        bugs[bugIdx] = bug
    } else {
        bug._id = utilService.makeId()
        bug.description = utilService.makeLorem()
        bug.createdAt = Date().now()
        bugs.unshift(bug)
    }
    return _saveBugsToFile().then(() => bug)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                console.log(err)
                return reject(err)
            }
            resolve()
        })
    })
}