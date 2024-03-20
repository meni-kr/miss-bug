import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


// get bugs
app.get('/api/bug', (req, res) => {

    const filterBy = {
        txt: req.query.txt || '',
        labels: req.query.labels || '',
        severity: +req.query.severity || 0  
    }
    const sortBy = {
        type: req.query.type || '',
        dir: +req.query.dir || 1
    }
    if (req.query.pageIdx) filterBy.pageIdx = req.query.pageIdx

    bugService.query(filterBy, sortBy)
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
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

    const bugToSave = req.body
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

// Update Bug
app.put('/api/bug', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    console.log('loggedinUser:', loggedinUser)
    console.log('req.body:', req.body)
    if (loggedinUser._id !== req.body.creator._id) return res.status(401).send('you canot update the bug')

    const bugToSave = req.body
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
    const bugId = req.params.bugId
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    bugService.getById(bugId)
        .then(bug => {
            if (loggedinUser._id !== bug.creator._id) return res.status(401).send('you canot update the bug')
            bugService.remove(bug._id)
                .then(() => {
                    loggerService.info(`Bug ${bugId} removed`)
                    res.send('Removed')
                })
                .catch((err) => {
                    loggerService.error('Cannot remove bug', err)
                    res.status(400).send('Cannot remove bug')
                })
        })
})

// AUTH API users

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)

