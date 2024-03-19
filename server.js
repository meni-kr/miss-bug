import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// app.get('/', (req, res) => res.send('my first server'))

// get bugs
app.get('/api/bug', (req, res) => {

    const filterBy = {
        txt: req.query.txt || '',
        // description: req.query.description || '',
        severity: +req.query.severity || 0,
        // pageIdx: req.query.pageIdx
    }

    bugService.query(filterBy)
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

// create Bug
app.post('/api/bug', (req, res) => {

    const bugToSave = req.body
    console.log(bugToSave);
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// Update Bug
app.put('/api/bug', (req, res) => {
    const bugToSave = {
        title: req.body.title,
        severity: +req.body.severity,
        description: req.body.description,
        _id: req.body._id,
        createdAt: +req.body.createdAt
    }
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot Update bug', err)
            res.status(400).send('Cannot Update bug')
        })
})

// Get Bug 
app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    const { visitedBugs = [] } = req.cookies 


    if (!visitedBugs.includes(bugId)) {
        if (visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
        else visitedBugs.push(bugId)
    }
    
    res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 70 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send('Cannot get bug')
        })
})

// remove bug
app.delete('/api/bug/:bugId', (req, res) => {
    console.log('delete....');
    const bugId = req.params.bugId
    bugService.remove(bugId)
        .then(() => {
            loggerService.info(`Bug ${bugId} removed`)
            res.send('Removed')
        })
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})


const PORT = 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)

